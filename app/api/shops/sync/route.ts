import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import {
  getOpenReceipts,
  getListingImageMap,
  refreshAccessToken,
  computeShipDate,
  EtsyApiError,
} from "@/lib/etsy/api";

interface SyncResult {
  shop_id: number;
  shop_name: string;
  upserted: number;
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

  // Fetch target shops
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
      // Attempt fetch; if 401 try to refresh the token first
      let receiptsResponse = await getOpenReceipts(
        shop.shop_id,
        accessToken
      ).catch(async (e: unknown) => {
        if (e instanceof EtsyApiError && e.isUnauthorized && shop.refresh_token) {
          const fresh = await refreshAccessToken(shop.refresh_token);
          accessToken = fresh.access_token;
          // Persist refreshed tokens
          await supabase
            .from("connected_shops")
            .update({
              access_token: fresh.access_token,
              refresh_token: fresh.refresh_token,
            })
            .eq("shop_id", shop.shop_id);
          return getOpenReceipts(shop.shop_id, accessToken);
        }
        throw e;
      });

      // Paginate if more than 100 receipts
      let allReceipts = receiptsResponse.results;
      while (
        receiptsResponse.count > allReceipts.length &&
        receiptsResponse.results.length === 100
      ) {
        receiptsResponse = await getOpenReceipts(
          shop.shop_id,
          accessToken,
          100,
          allReceipts.length
        );
        allReceipts = allReceipts.concat(receiptsResponse.results);
      }

      // Fetch receipt_ids already marked shipped locally so we never
      // overwrite them back to false when Etsy still says unshipped
      const { data: locallyShipped } = await supabase
        .from("etsy_orders")
        .select("receipt_id")
        .eq("shop_id", shop.shop_id)
        .eq("is_shipped", true);
      const protectedIds = new Set(
        (locallyShipped ?? []).map((o) => o.receipt_id)
      );

      // ── Diagnostics: log what Etsy actually returns on the first transaction ──
      const firstTx = allReceipts[0]?.transactions[0];
      if (firstTx) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw = firstTx as any;
        console.log("[sync] first transaction keys:", Object.keys(raw).sort().join(", "));
        console.log("[sync] listing_id:", raw.listing_id);
        console.log("[sync] product_data:", JSON.stringify(raw.product_data)?.slice(0, 300));
        console.log("[sync] selected_variations:", JSON.stringify(raw.selected_variations)?.slice(0, 300));
        console.log("[sync] variations:", JSON.stringify(raw.variations)?.slice(0, 300));
        console.log("[sync] image_url_75x75:", raw.image_url_75x75);
        console.log("[sync] images:", JSON.stringify(raw.images)?.slice(0, 200));
      }

      // Collect unique listing_ids, filtering out null/0 (deleted listings)
      const listingIds = [
        ...new Set(
          allReceipts
            .flatMap((r) => r.transactions.map((t) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              return (t as any).listing_id as number | null | undefined;
            }))
            .filter((id): id is number => id != null && id !== 0)
        ),
      ];
      const imageMap = await getListingImageMap(listingIds, accessToken);

      // Build upsert rows
      const rows = allReceipts.map((r) => {
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

          // ── Image: look up from per-listing fetch ──────────────────────────
          const image_url = (listingId ? imageMap.get(listingId) : null) ?? null;

          // ── Variations: try every known field path across Etsy API versions ─
          // v3 new: product_data.property_values[].{ property_name, values[] }
          // v3 old: selected_variations[].{ formatted_name, formatted_value }
          // v2 compat: variations[].{ formatted_name, formatted_value }
          type RawVariation = { property_name?: string; values?: string[]; formatted_name?: string; formatted_value?: string };
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
          // Etsy can return null receipt_state for some in-progress orders
          receipt_state: r.receipt_state ?? "open",
          // Never un-ship an order we already marked shipped locally
          is_shipped: r.is_shipped || protectedIds.has(r.receipt_id),
          is_paid: r.is_paid,
          buyer_name: r.name ?? null,
          total_price_cents: totalCents,
          currency_code:
            r.grandtotal?.currency_code ?? r.total_price?.currency_code ?? "USD",
          item_count: r.transactions.reduce((s, t) => s + (t.quantity ?? 1), 0),
          item_titles: itemTitles,
          // Shipping address
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
          // Buyer + seller messages
          buyer_message: r.message_from_buyer ?? null,
          seller_note: r.message_from_seller ?? null,
          // Full transaction detail (images, variations)
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

      // Update last_synced_at on the shop
      await supabase
        .from("connected_shops")
        .update({ last_synced_at: new Date().toISOString() })
        .eq("shop_id", shop.shop_id);

      results.push({ shop_id: shop.shop_id, shop_name: shop.shop_name, upserted: rows.length });
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.message
          : typeof e === "object" && e !== null && "message" in e
          ? String((e as { message: unknown }).message)
          : JSON.stringify(e);
      console.error(`[sync] shop ${shop.shop_id} failed:`, msg);
      results.push({ shop_id: shop.shop_id, shop_name: shop.shop_name, upserted: 0, error: msg });
    }
  }

  const totalUpserted = results.reduce((s, r) => s + r.upserted, 0);
  const hasErrors = results.some((r) => r.error);

  return NextResponse.json(
    { ok: !hasErrors, totalUpserted, results },
    { status: hasErrors ? 207 : 200 }
  );
}
