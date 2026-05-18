/**
 * POST /api/shops/sync
 *
 * Syncs open Etsy orders into the etsy_orders cache table for all connected
 * shops (or a single shop when ?shop_id=xxx is supplied).
 *
 * Rate-limit budget (Personal Access tier):
 *   • 5 QPS  — enforced in lib/etsy/api.ts (sequential calls + 250 ms delay)
 *   • 5,000 QPD — protected by the listing_images Supabase cache (images are
 *     fetched from Etsy only on the first sync, then served from the DB)
 *
 * Shops are processed sequentially. A rate-limit error that survives all
 * retries (EtsyApiError 429) aborts the current shop and continues to the
 * next, so one misbehaving shop never kills the entire batch.
 */

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import {
  getOpenReceipts,
  getListingImageMap,
  refreshAccessToken,
  computeShipDate,
  EtsyApiError,
} from "@/lib/etsy/api";
import type { SupabaseClient } from "@supabase/supabase-js";

/* ─────────────────────── operational constants ───────────────── */

/**
 * Only pull receipts created within this window.
 * Orders older than 30 days that are still "unshipped" on Etsy are almost
 * certainly ones the seller dispatched without updating Etsy — they should
 * never appear on the dashboard.
 */
const FETCH_WINDOW_DAYS = 30;

/**
 * Skip any receipt whose dispatch deadline has already passed by more than
 * this many days (ghost-order stale guard).
 * Even within the 30-day fetch window, an order whose ship date was 8+ days
 * ago and is still marked unshipped on Etsy is a "ghost" — the seller shipped
 * the parcel but forgot to complete the order on Etsy.
 */
const STALE_GUARD_DAYS = 7;

/**
 * Delete shipped orders from our local cache after this many days.
 * Our etsy_orders table is an operational cache, not a history store.
 * Old fulfilled orders remain permanently on Etsy for the seller's records.
 */
const SHIPPED_TTL_DAYS = 7;

/**
 * How long a listing image URL is considered fresh in the Supabase cache.
 * After this, we re-fetch from Etsy so images stay current if a seller
 * updates their listing photos.
 */
const IMAGE_CACHE_TTL_DAYS = 30;

/* ─────────────────────────── types ──────────────────────────── */

interface SyncResult {
  shop_id: number;
  shop_name: string;
  upserted: number;
  pruned: number;
  skipped_ghosts: number;
  images_from_cache: number;
  images_from_etsy: number;
  error?: string;
}

/* ──────────────────── image cache helper ────────────────────── */

/**
 * Returns a Map<listing_id, image_url> for the given listing IDs.
 *
 * Strategy (protects the 5,000 QPD budget):
 *   1. Query the `listing_images` Supabase table for cached entries that are
 *      still within IMAGE_CACHE_TTL_DAYS.
 *   2. Only call the Etsy API for the IDs that are missing or stale.
 *   3. Upsert new results back into the cache so future syncs are free.
 *
 * Etsy calls are delegated to getListingImageMap (lib/etsy/api.ts) which
 * enforces sequential fetching at 4 req/s.
 */
async function getCachedImageMap(
  listingIds: number[],
  accessToken: string,
  supabase: SupabaseClient
): Promise<{ map: Map<number, string>; cacheHits: number; cacheMisses: number }> {
  const imageMap = new Map<number, string>();

  if (listingIds.length === 0) {
    return { map: imageMap, cacheHits: 0, cacheMisses: 0 };
  }

  // ── 1. Check Supabase cache ──────────────────────────────────────────────
  const cacheCutoff = new Date(
    Date.now() - IMAGE_CACHE_TTL_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data: cachedRows } = await supabase
    .from("listing_images")
    .select("listing_id, image_url")
    .in("listing_id", listingIds)
    .gte("updated_at", cacheCutoff);

  const cachedIds = new Set<number>();
  for (const row of cachedRows ?? []) {
    imageMap.set(row.listing_id as number, row.image_url as string);
    cachedIds.add(row.listing_id as number);
  }

  const uncachedIds = listingIds.filter((id) => !cachedIds.has(id));
  const cacheHits = cachedIds.size;

  // ── 2. Fetch misses from Etsy ────────────────────────────────────────────
  if (uncachedIds.length === 0) {
    console.log(
      `[sync] image cache: all ${cacheHits} image(s) served from cache — 0 Etsy calls`
    );
    return { map: imageMap, cacheHits, cacheMisses: 0 };
  }

  console.log(
    `[sync] image cache: ${cacheHits} hit(s), ${uncachedIds.length} miss(es) → fetching from Etsy`
  );

  const fetchedMap = await getListingImageMap(uncachedIds, accessToken);

  // ── 3. Write new entries back to cache ──────────────────────────────────
  if (fetchedMap.size > 0) {
    const now = new Date().toISOString();
    const newRows = Array.from(fetchedMap.entries()).map(([listing_id, image_url]) => ({
      listing_id,
      image_url,
      updated_at: now,
    }));

    const { error: cacheErr } = await supabase
      .from("listing_images")
      .upsert(newRows, { onConflict: "listing_id" });

    if (cacheErr) {
      // Non-fatal — images will still display, just won't be cached
      console.warn("[sync] image cache write failed:", cacheErr.message);
    } else {
      console.log(`[sync] image cache: stored ${newRows.length} new entry(s)`);
    }

    for (const [id, url] of fetchedMap) {
      imageMap.set(id, url);
    }
  }

  return { map: imageMap, cacheHits, cacheMisses: fetchedMap.size };
}

/* ─────────────────────────── handler ───────────────────────── */

export async function POST(request: NextRequest) {
  const shopIdParam = request.nextUrl.searchParams.get("shop_id");
  const supabase = createSupabaseServerClient();

  // ── Load target shops ────────────────────────────────────────────────────
  let shopsQuery = supabase
    .from("connected_shops")
    .select("shop_id, shop_name, access_token, refresh_token")
    .eq("is_active", true);

  if (shopIdParam) {
    shopsQuery = shopsQuery.eq("shop_id", Number(shopIdParam));
  }

  const { data: shops, error: shopsErr } = await shopsQuery;
  if (shopsErr) {
    return NextResponse.json({ error: "Failed to load shops" }, { status: 500 });
  }
  if (!shops?.length) {
    return NextResponse.json({ error: "No connected shops found" }, { status: 404 });
  }

  const results: SyncResult[] = [];

  // ── Process each shop sequentially ───────────────────────────────────────
  // Sequential (not parallel) for two reasons:
  //   1. Each shop issues multiple Etsy API calls; concurrent shops would
  //      easily exceed the 5 QPS limit.
  //   2. A 429 on one shop should not abort another shop's sync.
  for (const shop of shops) {
    let accessToken: string = shop.access_token;

    try {
      // ── Step 1: Fetch open receipts ───────────────────────────────────────
      let receiptsResponse = await getOpenReceipts(
        shop.shop_id,
        accessToken,
        100,
        0,
        FETCH_WINDOW_DAYS
      ).catch(async (e: unknown) => {
        // Auto-refresh on 401 then retry once
        if (e instanceof EtsyApiError && e.isUnauthorized && shop.refresh_token) {
          console.log(`[sync] shop ${shop.shop_id}: access token expired — refreshing`);
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

      // Paginate
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

      // ── Step 2: Stale-guard — drop ghost orders ───────────────────────────
      // Ghost orders are ones where the dispatch deadline passed more than
      // STALE_GUARD_DAYS ago and Etsy still lists them as unshipped. This
      // happens when a seller ships physically but never updates Etsy.
      const staleThresholdMs = Date.now() - STALE_GUARD_DAYS * 24 * 60 * 60 * 1000;

      const freshReceipts = allReceipts.filter((r) => {
        const shipDate = computeShipDate(r);
        if (!shipDate) return true;
        const isGhost = shipDate.getTime() < staleThresholdMs;
        if (isGhost) {
          console.log(
            `[sync] ghost-guard: skipping #${r.receipt_id} ` +
            `(deadline ${shipDate.toISOString().slice(0, 10)}, ` +
            `>${STALE_GUARD_DAYS}d past)`
          );
        }
        return !isGhost;
      });
      const skippedGhosts = allReceipts.length - freshReceipts.length;

      // ── Step 3: Images — cache-first, Etsy-on-miss ───────────────────────
      const listingIds = [
        ...new Set(
          freshReceipts
            .flatMap((r) =>
              r.transactions.map((t) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return (t as any).listing_id as number | null | undefined;
              })
            )
            .filter((id): id is number => id != null && id !== 0)
        ),
      ];

      const {
        map: imageMap,
        cacheHits,
        cacheMisses,
      } = await getCachedImageMap(listingIds, accessToken, supabase);

      // ── Step 4: Build upsert rows ─────────────────────────────────────────
      const rows = freshReceipts.map((r) => {
        const shipDate = computeShipDate(r);
        const itemTitles = [
          ...new Set(r.transactions.map((t) => t.title).filter(Boolean)),
        ];
        const totalCents = Math.round(
          ((r.grandtotal?.amount ?? r.total_price?.amount ?? 0) /
            (r.grandtotal?.divisor ?? r.total_price?.divisor ?? 100)) *
            100
        );

        const transactionsJson = r.transactions.map((t) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const raw = t as any;
          const listingId: number | null = raw.listing_id ?? null;
          const image_url = (listingId ? imageMap.get(listingId) : null) ?? null;

          // Try all known Etsy v3 field paths for buyer-selected variations
          type RawVariation = {
            property_name?: string;
            values?: string[];
            formatted_name?: string;
            formatted_value?: string;
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
          // Use Etsy's shipped status — locally-completed orders are fixed
          // in Step 5 (shipped_at is authoritative when set by our app)
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
          .upsert(rows, { onConflict: "receipt_id" });
        if (upsertErr) throw upsertErr;
      }

      // ── Step 5: Restore local shipped status ──────────────────────────────
      // The upsert above writes Etsy's is_shipped=false for orders the seller
      // completed via our app (our app calls Etsy's tracking API, but there
      // can be a propagation delay). Any row with a shipped_at timestamp was
      // completed by the seller — mark it shipped regardless of Etsy's value.
      const fetchedIds = freshReceipts.map((r) => r.receipt_id);
      if (fetchedIds.length > 0) {
        await supabase
          .from("etsy_orders")
          .update({ is_shipped: true })
          .eq("shop_id", shop.shop_id)
          .in("receipt_id", fetchedIds)
          .not("shipped_at", "is", null);
      }

      // ── Step 6: Auto-close orders Etsy no longer lists ────────────────────
      // If an order was open in our DB (no shipped_at) but Etsy stopped
      // returning it in the unshipped queue, the seller marked it shipped
      // directly on Etsy. Close it locally.
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
          `[sync] auto-closing ${goneFromEtsy.length} order(s) no longer in Etsy queue:`,
          goneFromEtsy
        );
        await supabase
          .from("etsy_orders")
          .update({ is_shipped: true, shipped_at: new Date().toISOString() })
          .in("receipt_id", goneFromEtsy);
      }

      // ── Step 7: TTL prune — delete old shipped orders ─────────────────────
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

      await supabase
        .from("connected_shops")
        .update({ last_synced_at: new Date().toISOString() })
        .eq("shop_id", shop.shop_id);

      results.push({
        shop_id: shop.shop_id,
        shop_name: shop.shop_name,
        upserted: rows.length,
        pruned: prunedCount,
        skipped_ghosts: skippedGhosts,
        images_from_cache: cacheHits,
        images_from_etsy: cacheMisses,
      });
    } catch (e) {
      // ── Graceful shop-level error handling ──────────────────────────────
      // A 429 that survived all retries means we're out of quota for now.
      // Skip this shop and continue to the next — do not abort the batch.
      const isRateLimit = e instanceof EtsyApiError && e.isRateLimited;
      const msg =
        e instanceof Error
          ? e.message
          : typeof e === "object" && e !== null && "message" in e
          ? String((e as { message: unknown }).message)
          : JSON.stringify(e);

      console.error(
        `[sync] shop ${shop.shop_id} (${shop.shop_name}) failed${isRateLimit ? " — RATE LIMITED" : ""}:`,
        msg
      );

      results.push({
        shop_id: shop.shop_id,
        shop_name: shop.shop_name,
        upserted: 0,
        pruned: 0,
        skipped_ghosts: 0,
        images_from_cache: 0,
        images_from_etsy: 0,
        error: isRateLimit ? "Rate limit hit — try again later" : msg,
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
