import { Suspense } from "react";
import { createSupabaseServerClient } from "@/lib/supabase";
import { getUrgencyInfo } from "@/lib/etsy/urgency";
import OrdersTable from "@/components/dashboard/OrdersTable";
import SyncButton from "@/components/dashboard/SyncButton";
import {
  ShoppingBag,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Store,
} from "lucide-react";

export const dynamic = "force-dynamic";

async function getOrdersData() {
  const supabase = createSupabaseServerClient();

  const [{ data: orders }, { data: shops }] = await Promise.all([
    supabase
      .from("etsy_orders")
      .select(
        "receipt_id, shop_id, buyer_name, item_count, item_titles, expected_ship_date, is_shipped, receipt_state, etsy_created_at, ship_address, ship_country_iso, buyer_message, seller_note, transactions_json, tracking_number, shipped_at, connected_shops!inner(shop_name, shop_icon_url)"
      )
      .order("expected_ship_date", { ascending: true, nullsFirst: false })
      .limit(500),
    supabase
      .from("connected_shops")
      .select("shop_id, shop_name")
      .eq("is_active", true),
  ]);

  // Flatten joined shop data
  const flatOrders = (orders ?? []).map((o) => {
    const cs = o.connected_shops as unknown as {
      shop_name: string;
      shop_icon_url: string | null;
    } | null;
    return {
      receipt_id: o.receipt_id as number,
      shop_id: o.shop_id as number,
      shop_name: cs?.shop_name ?? "Unknown Shop",
      shop_icon_url: cs?.shop_icon_url ?? null,
      buyer_name: o.buyer_name as string | null,
      item_count: o.item_count as number,
      item_titles: (o.item_titles as string[]) ?? [],
      expected_ship_date: o.expected_ship_date as string | null,
      etsy_created_at: o.etsy_created_at as string | null,
      is_shipped: o.is_shipped as boolean,
      receipt_state: o.receipt_state as string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ship_address: (o.ship_address as any) ?? null,
      ship_country_iso: o.ship_country_iso as string | null,
      buyer_message: o.buyer_message as string | null,
      seller_note: o.seller_note as string | null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transactions: ((o.transactions_json as any[]) ?? []),
      tracking_number: o.tracking_number as string | null,
      shipped_at: o.shipped_at as string | null,
    };
  });

  return { orders: flatOrders, shops: shops ?? [] };
}

function buildStats(
  orders: Awaited<ReturnType<typeof getOrdersData>>["orders"]
) {
  let open = 0, urgent = 0, atRisk = 0, shippedThisWeek = 0;
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  for (const o of orders) {
    if (o.is_shipped) {
      // Only count orders dispatched within the last 7 days.
      // Our TTL prune removes them from the DB after that, so this
      // stat reflects "dispatched this week" — a meaningful activity
      // metric, not a cumulative count of all historical shipments.
      if (o.shipped_at && new Date(o.shipped_at).getTime() > weekAgo) {
        shippedThisWeek++;
      }
      continue;
    }
    open++;
    const u = getUrgencyInfo(o.expected_ship_date, false);
    if (u.level === "overdue" || u.level === "critical") urgent++;
    else if (u.level === "warning") atRisk++;
  }

  return { open, urgent, atRisk, shipped: shippedThisWeek };
}

export default async function DashboardPage() {
  const { orders, shops } = await getOrdersData();
  const stats = buildStats(orders);
  const hasShops = shops.length > 0;
  const hasOrders = orders.length > 0;

  return (
    <div className="flex flex-col gap-0">
      {/* Page header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-slate-50/95 px-6 py-4 backdrop-blur-sm">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Orders</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {hasOrders
              ? `${stats.open} open across ${shops.length} shop${shops.length !== 1 ? "s" : ""}`
              : "Connect a shop to start syncing orders"}
          </p>
        </div>
        <SyncButton label="Sync All" />
      </div>

      <div className="px-6 py-6 flex flex-col gap-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            icon={<ShoppingBag className="h-5 w-5" />}
            label="Open Orders"
            value={stats.open}
            colorClass="text-indigo-600 bg-indigo-50"
          />
          <StatCard
            icon={<AlertTriangle className="h-5 w-5" />}
            label="Urgent"
            value={stats.urgent}
            colorClass={stats.urgent > 0 ? "text-red-600 bg-red-50" : "text-slate-400 bg-slate-100"}
          />
          <StatCard
            icon={<Clock className="h-5 w-5" />}
            label="At Risk"
            value={stats.atRisk}
            colorClass={stats.atRisk > 0 ? "text-amber-600 bg-amber-50" : "text-slate-400 bg-slate-100"}
          />
          <StatCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            label="Shipped This Week"
            value={stats.shipped}
            colorClass="text-emerald-600 bg-emerald-50"
          />
        </div>

        {/* Empty state — no shops connected */}
        {!hasShops && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50">
              <Store className="h-7 w-7 text-indigo-500" strokeWidth={1.5} />
            </div>
            <h2 className="mt-4 text-base font-semibold text-slate-800">
              No shops connected yet
            </h2>
            <p className="mt-1.5 text-sm text-slate-500 max-w-sm mx-auto">
              Connect your first Etsy shop via OAuth to start syncing orders into
              the dashboard.
            </p>
            <a
              href="/api/oauth/authorize"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
            >
              Connect a Shop
            </a>
          </div>
        )}

        {/* Orders table */}
        {hasShops && (
          <Suspense fallback={<TableSkeleton />}>
            <OrdersTable orders={orders} shops={shops} />
          </Suspense>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  colorClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  colorClass: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className={`inline-flex rounded-lg p-2 ${colorClass}`}>{icon}</div>
      <p className="mt-3 text-2xl font-bold tabular-nums text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 bg-slate-50 h-10" />
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-b border-slate-100">
          <div className="h-3 w-16 rounded bg-slate-200" />
          <div className="h-3 w-24 rounded bg-slate-200" />
          <div className="h-3 w-40 rounded bg-slate-200" />
          <div className="h-3 w-20 rounded bg-slate-200 ml-auto" />
        </div>
      ))}
    </div>
  );
}
