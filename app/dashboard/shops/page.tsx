import { createSupabaseServerClient } from "@/lib/supabase";
import ShopCard from "@/components/dashboard/ShopCard";
import SyncButton from "@/components/dashboard/SyncButton";
import { Store, Plus, Info } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shops — SellerSyncHub Dashboard",
};

async function getShopsWithOrderCounts() {
  const supabase = createSupabaseServerClient();

  const [{ data: shops }, { data: orderCounts }] = await Promise.all([
    supabase
      .from("connected_shops")
      .select(
        "shop_id, shop_name, shop_title, shop_icon_url, listing_active_count, connected_at, last_synced_at, is_active"
      )
      .eq("is_active", true)
      .order("connected_at", { ascending: true }),
    supabase
      .from("etsy_orders")
      .select("shop_id")
      .eq("is_shipped", false)
      .in("receipt_state", ["paid", "completed"]),
  ]);

  const countMap: Record<number, number> = {};
  for (const row of orderCounts ?? []) {
    countMap[row.shop_id as number] = (countMap[row.shop_id as number] ?? 0) + 1;
  }

  return (shops ?? []).map((s) => ({
    ...s,
    order_count: countMap[s.shop_id as number] ?? 0,
  }));
}

export default async function ShopsPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; connect_warning?: string }>;
}) {
  const sp = await searchParams;
  const shops = await getShopsWithOrderCounts();

  return (
    <div className="flex flex-col gap-0">
      {/* Page header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-slate-50/95 px-6 py-4 backdrop-blur-sm">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Connected Shops</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {shops.length}/5 shops connected (personal access limit)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SyncButton label="Sync All" />
          {shops.length < 5 && (
            <a
              href="/api/oauth/authorize"
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
              data-no-prefetch
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              Connect Shop
            </a>
          )}
        </div>
      </div>

      <div className="px-6 py-6 flex flex-col gap-5">
        {/* Success / warning banners */}
        {sp.connected === "1" && (
          <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <Store className="h-4 w-4 shrink-0" />
            Shop connected successfully! Click <strong>Sync All</strong> to load
            your orders.
          </div>
        )}
        {sp.connect_warning === "shop_save_failed" && (
          <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            <Info className="h-4 w-4 shrink-0" />
            OAuth succeeded but we couldn&apos;t save the shop. Please try
            connecting again.
          </div>
        )}

        {/* Personal access notice */}
        <div className="flex items-start gap-3 rounded-lg border border-indigo-100 bg-indigo-50/60 px-4 py-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
          <p className="text-xs text-indigo-700 leading-relaxed">
            <strong>Personal access</strong> allows up to 5 shops — perfect for
            building and validating the product. Connect your own shops or up to
            4 seller friends&apos; shops to test all features before applying for
            commercial access.
          </p>
        </div>

        {/* Shops grid */}
        {shops.length === 0 ? (
          <EmptyShopsState />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {shops.map((shop) => (
              <ShopCard key={shop.shop_id} shop={shop as Parameters<typeof ShopCard>[0]["shop"]} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyShopsState() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50">
        <Store className="h-7 w-7 text-indigo-500" strokeWidth={1.5} />
      </div>
      <h2 className="mt-4 text-base font-semibold text-slate-800">
        No shops connected
      </h2>
      <p className="mt-1.5 text-sm text-slate-500 max-w-sm mx-auto">
        Click below to start the Etsy OAuth flow. You&apos;ll be redirected to
        Etsy to grant read access to your shop&apos;s orders.
      </p>
      <a
        href="/api/oauth/authorize"
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
        Connect Your First Shop
      </a>
    </div>
  );
}
