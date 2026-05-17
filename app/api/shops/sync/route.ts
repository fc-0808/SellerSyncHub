import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import {
  getOpenReceipts,
  getListingImageMap,
  refreshAccessToken,
  computeShipDate,
  EtsyApiError,
} from "@/lib/etsy/api";

// ── Retention policy constants ────────────────────────────────────────────────
//
// FETCH_WINDOW_DAYS: only pull receipts created within this many days from Etsy.
// Orders older than this are operationally irrelevant — if a seller hasn't
// dispatched a 30-day-old order, it's been handled outside our system.
//
// STALE_GUARD_DAYS: even within the fetch window, skip receipts whose dispatch
// deadline has already passed by more than this many days. These are "ghost"
// orders — the seller shipped the package but never updated Etsy. They will
// appear forever in Etsy's "unshipped" queue; we must not let them pollute our
// dashboard.
//
// SHIPPED_TTL_DAYS: automatically delete shipped orders from our local cache
// after this many days. Our DB is an operational cache, not a history store —
// old fulfilled orders belong in Etsy, not here.
//
const FETCH_WINDOW_DAYS  = 30;
const STALE_GUARD_DAYS   = 7;
const SHIPPED_TTL_DAYS   = 7;

interface SyncResult {
  shop_id: number;
  shop_name: string;
  upserted: number;
  pruned: number;
  skipped: number;
  error?: string;
}

/**
 * POST /api/shops/sync
 * Fetches open receipts from Etsy for all (or one) connected shop(s)
 * and upserts them into the etsy_orders table.
 *
 * Optional query param: ?shop_id=xxx  — sync only that shop
 */
export async function POST(request: NextRequest) {
  const shopIdParam = request.nextUrl.searchParams.get("shop_id");
  const supabase = createSupabaseServerClient();

  let query = supabase
    .from("connected_shops")
    .select("shop_id, shop_name, access_token, refresh_token")
    .eq("is_active", true);

  if (shopIdParam) {
    query = query.eq("shop_id", Number(shopIdParam));
  }

  const { data: shops, error: shopsErr } = await query;
  if (shopsErr) {
    return NextResponse.json({ error: "Failed to load shops" }, { status: 500 });
  }
  if (!shops?.length) {
    return NextResponse.json({ error: "No connected shops found" }, { status: 404 });
  }

  const results: SyncResult[] = [];

  for (const shop of shops) {
    let accessToken: string = shop.access_token;

    try {
      // ── 1. Fetch open receipts from Etsy ─────────────────────────────────
      let receiptsResponse = await getOpenReceipts(
        shop.shop_id,
        accessToken,
        100,
        0,
        FETCH_WINDOW_DAYS
      ).catch(async (e: unknown) => {
        if (e instanceof EtsyApiError && e.isUnauthorized && shop.refresh_token) {
          const fresh = await refreshAccessToken(shop.refresh_token);
          accessToken = fresh.access_token;
          await supabase
            .from("connected_shops")
            .update({
              access_token: fresh.access_token,
              refresh_token: fresh.refresh_token,
            })
            .eq("shop_id", shop.shop_id);
          return getOpenReceipts(shop.shop_id, accessToken, 100, 0, FETCH_WINDOW_DAYS);
        }
        throw e;
      });

      // Paginate if needed
      let allReceipts = receiptsResponse.results;
      while (
        receiptsResponse.count > allReceipts.length &&
        receiptsResponse.results.length === 100
      ) {
        receiptsResponse = await getOpenReceipts(
          shop.shop_id,
          accessToken,
          100,
          allReceipts.length,
          FETCH_WINDOW_DAYS
        );
        allReceipts = allReceipts.concat(receiptsResponse.results);
      }

      // ── 2. Stale-guard: drop ghost orders ────────────────────────────────
      // A ghost order is one whose dispatch deadline has already passed by more
      // than STALE_GUARD_DAYS. The seller shipped the package without updating
      // Etsy; these orders sit in Etsy's "unshipped" queue indefinitely.
      // Filtering them here prevents them from ever reaching our DB.
      const staleThresholdMs = Date.now() - STALE_GUARD_DAYS * 24 * 60 * 60 * 1000;

      const freshReceipts = allReceipts.filter((r) => {
        const shipDate = computeShipDate(r);
        if (!shipDate) return true; // No deadline — keep it
        const isStale = shipDate.getTime() < staleThresholdMs;
        if (isStale) {
          console.log(
            `[sync] skipping ghost order #${r.receipt_id} (deadline ${shipDate.toISOString()} is >` +
            ` ${STALE_GUARD_DAYS}d past)`
          );
        }
        return !isStale;
      });
      const skipped = allReceipts.length - freshReceipts.length;

      // ── 3. Diagnostics on first transaction ──────────────────────────────
      const firstTx = freshReceipts[0]?.transactions[0];
      if (firstTx) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw = firstTx as any;
        console.log("[sync] first transaction keys:", Object.keys(raw).sort().join(", "));
        console.log("[sync] product_data:", JSON.stringify(raw.product_data)?.slice(0, 300));
      }

      // ── 4. Batch-fetch images ─────────────────────────────────────────────
      const listingIds = [
        ...new Set(
          freshReceipts
            .flatMap((r) => r.transactions.map((t) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              return (t as any).listing_id as number | null | undefined;
            }))
            .filter((id): id is number => id != null && id !== 0)
        ),
      ];
      const imageMap = await getListingImageMap(listingIds, accessToken);

      // ── 5. Build upsert rows ──────────────────────────────────────────────
      const rows = freshReceipts.map((r) => {
        const shipDate = computeShipDate(r);
        const itemTitles = [
          ...new Set(r.transactions.map((t) => t.title).filter(Boolean)),
        ];
        const totalCents = Math.round(
          (r.grandtotal?.amount ?? r.total_price?.amount ?? 0) /
            (r.grandtotal?.divisor ?? r.total_price?.divisor ?? 100) *
            100
        );

        const transactionsJson = r.transactions.map((t) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const raw = t as any;
          const listingId: number | null = raw.listing_id ?? null;
          const image_url = (listingId ? imageMap.get(listingId) : null) ?? null;

          // Try all known Etsy API field paths for variations
          type RawVariation = {
            property_name?: string; values?: string[];
            formatted_name?: string; formatted_value?: string;
          };
          let variations: { name: string; value: string }[] = [];

          const propValues: RawVariation[] = raw.product_data?.property_values ?? [];
          if (propValues.length > 0) {
            variations = propValues
              .filter((pv) => pv.values && pv.values.length > 0)
              .map((pv) => ({ name: pv.property_name ?? "", value: pv.values![0] }))
              .filter((v) => v.name && v.value);
          }
          if (variations.length === 0) {
            const selVars: RawVariation[] = raw.selected_variations ?? raw.variations ?? [];
            variations = selVars
              .filter((v) => v.formatted_name && v.formatted_value)
              .map((v) => ({ name: v.formatted_name!, value: v.formatted_value! }));
          }

          return {
            transaction_id: t.transaction_id,
            listing_id: listingId,
            title: t.title,
            quantity: t.quantity ?? 1,
            image_url,
            variations,
          };
        });

        return {
          shop_id: shop.shop_id,
          receipt_id: r.receipt_id,
          receipt_state: r.receipt_state ?? "open",
          // Etsy says unshipped, but our local shipped_at is authoritative
          // (user completed it via our app — Etsy just hasn't been updated yet)
          is_shipped: r.is_shipped,
          is_paid: r.is_paid,
          buyer_name: r.name ?? null,
          total_price_cents: totalCents,
          currency_code:
            r.grandtotal?.currency_code ?? r.total_price?.currency_code ?? "USD",
          item_count: r.transactions.reduce((s, t) => s + (t.quantity ?? 1), 0),
          item_titles: itemTitles,
          ship_address: {
            first_line: r.first_line ?? null,
            second_line: r.second_line ?? null,
            city: r.city ?? null,
            state: r.state ?? null,
            zip: r.zip ?? null,
            country_iso: r.country_iso ?? null,
            formatted: r.formatted_address ?? null,
          },
          ship_country_iso: r.country_iso ?? null,
          buyer_message: r.message_from_buyer ?? null,
          seller_note: r.message_from_seller ?? null,
          transactions_json: transactionsJson,
          expected_ship_date: shipDate?.toISOString() ?? null,
          etsy_created_at: new Date(
            (r.created_timestamp ?? r.create_timestamp) * 1000
          ).toISOString(),
          etsy_updated_at: new Date(
            (r.updated_timestamp ?? r.update_timestamp) * 1000
          ).toISOString(),
          synced_at: new Date().toISOString(),
        };
      });

      if (rows.length > 0) {
        const { error: upsertErr } = await supabase
          .from("etsy_orders")
          .upsert(rows, {
            onConflict: "receipt_id",
            // CRITICAL: never let Etsy overwrite a locally-set shipped_at or
            // tracking_number — those are set by the user via our Complete Order
            // flow and represent ground truth even before Etsy is updated.
            ignoreDuplicates: false,
          });
        if (upsertErr) throw upsertErr;
      }

      // ── 6. Preserve local shipped status ─────────────────────────────────
      // If an order was completed via our app (has shipped_at set) but Etsy
      // hasn't been updated yet, the upsert above set is_shipped=false.
      // Restore is_shipped=true for any row that has a shipped_at timestamp.
      const fetchedIds = freshReceipts.map((r) => r.receipt_id);
      if (fetchedIds.length > 0) {
        await supabase
          .from("etsy_orders")
          .update({ is_shipped: true })
          .eq("shop_id", shop.shop_id)
          .in("receipt_id", fetchedIds)
          .not("shipped_at", "is", null);
      }

      // ── 7. Auto-close: orders Etsy no longer lists ───────────────────────
      // If an order is open in our DB (no shipped_at) but Etsy stopped
      // returning it in the unshipped queue within our window, the seller
      // marked it shipped directly on Etsy. Close it locally.
      const fetchedSet = new Set(fetchedIds);
      const windowCutoff = new Date(
        Date.now() - FETCH_WINDOW_DAYS * 24 * 60 * 60 * 1000
      ).toISOString();

      const { data: openInDb } = await supabase
        .from("etsy_orders")
        .select("receipt_id")
        .eq("shop_id", shop.shop_id)
        .eq("is_shipped", false)
        .is("shipped_at", null)
        .gte("etsy_created_at", windowCutoff);

      const goneFromEtsy = (openInDb ?? [])
        .map((o) => o.receipt_id as number)
        .filter((id) => !fetchedSet.has(id));

      if (goneFromEtsy.length > 0) {
        console.log(
          `[sync] auto-closing ${goneFromEtsy.length} order(s) gone from Etsy:`,
          goneFromEtsy
        );
        await supabase
          .from("etsy_orders")
          .update({ is_shipped: true, shipped_at: new Date().toISOString() })
          .in("receipt_id", goneFromEtsy);
      }

      // ── 8. Prune old shipped orders (TTL) ────────────────────────────────
      // Our DB is a live operational cache. Shipped orders older than
      // SHIPPED_TTL_DAYS are no longer actionable — delete them entirely.
      // They remain permanently on Etsy for the seller's records.
      const shippedTtlCutoff = new Date(
        Date.now() - SHIPPED_TTL_DAYS * 24 * 60 * 60 * 1000
      ).toISOString();

      const { data: pruned } = await supabase
        .from("etsy_orders")
        .delete()
        .eq("shop_id", shop.shop_id)
        .eq("is_shipped", true)
        .lt("shipped_at", shippedTtlCutoff)
        .select("receipt_id");

      const prunedCount = pruned?.length ?? 0;
      if (prunedCount > 0) {
        console.log(`[sync] pruned ${prunedCount} shipped order(s) past TTL`);
      }

      // Update last_synced_at on the shop
      await supabase
        .from("connected_shops")
        .update({ last_synced_at: new Date().toISOString() })
        .eq("shop_id", shop.shop_id);

      results.push({
        shop_id: shop.shop_id,
        shop_name: shop.shop_name,
        upserted: rows.length,
        pruned: prunedCount,
        skipped,
      });
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.message
          : typeof e === "object" && e !== null && "message" in e
          ? String((e as { message: unknown }).message)
          : JSON.stringify(e);
      console.error(`[sync] shop ${shop.shop_id} failed:`, msg);
      results.push({
        shop_id: shop.shop_id,
        shop_name: shop.shop_name,
        upserted: 0,
        pruned: 0,
        skipped: 0,
        error: msg,
      });
    }
  }

  const totalUpserted = results.reduce((s, r) => s + r.upserted, 0);
  const hasErrors = results.some((r) => r.error);

  return NextResponse.json(
    { ok: !hasErrors, totalUpserted, results },
    { status: hasErrors ? 207 : 200 }
  );
}
