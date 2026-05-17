"use client";

import { useState, useMemo } from "react";
import { ChevronDown, Package, Store, Clock } from "lucide-react";
import { getUrgencyInfo, formatPrice, formatDeadlineDate } from "@/lib/etsy/urgency";

interface OrderRow {
  receipt_id: number;
  shop_id: number;
  shop_name: string;
  shop_icon_url: string | null;
  buyer_name: string | null;
  item_count: number;
  item_titles: string[];
  total_price_cents: number;
  currency_code: string;
  expected_ship_date: string | null;
  is_shipped: boolean;
  receipt_state: string;
}

interface Props {
  orders: OrderRow[];
  shops: { shop_id: number; shop_name: string }[];
}

const URGENCY_SORT: Record<string, number> = {
  overdue: 0,
  critical: 1,
  warning: 2,
  ok: 3,
  shipped: 4,
};

export default function OrdersTable({ orders, shops }: Props) {
  const [shopFilter, setShopFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("open");

  const filtered = useMemo(() => {
    return orders
      .filter((o) => shopFilter === "all" || o.shop_id === Number(shopFilter))
      .filter((o) => {
        if (statusFilter === "open") return !o.is_shipped;
        if (statusFilter === "shipped") return o.is_shipped;
        return true;
      })
      .map((o) => ({ ...o, urgency: getUrgencyInfo(o.expected_ship_date, o.is_shipped) }))
      .sort(
        (a, b) =>
          (URGENCY_SORT[a.urgency.level] ?? 5) -
          (URGENCY_SORT[b.urgency.level] ?? 5)
      );
  }, [orders, shopFilter, statusFilter]);

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <FilterSelect
          value={shopFilter}
          onChange={setShopFilter}
          icon={<Store className="h-3.5 w-3.5" />}
          options={[
            { value: "all", label: "All Shops" },
            ...shops.map((s) => ({ value: String(s.shop_id), label: s.shop_name })),
          ]}
        />
        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          icon={<Clock className="h-3.5 w-3.5" />}
          options={[
            { value: "open", label: "Open Orders" },
            { value: "shipped", label: "Shipped" },
            { value: "all", label: "All" },
          ]}
        />
        <span className="ml-auto text-xs text-slate-400">
          {filtered.length} order{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Order
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Shop
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Items
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Buyer
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Ship By
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((order) => (
                  <tr
                    key={order.receipt_id}
                    className={`hover:bg-slate-50/80 transition-colors ${order.urgency.rowClass}`}
                  >
                    <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs text-slate-600 font-medium">
                      #{order.receipt_id}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <ShopAvatar name={order.shop_name} iconUrl={order.shop_icon_url} />
                        <span className="text-xs font-medium text-slate-700 whitespace-nowrap">
                          {order.shop_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 max-w-[220px]">
                      <div className="flex items-start gap-1.5">
                        <Package className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" strokeWidth={1.8} />
                        <div>
                          <p className="text-xs text-slate-700 line-clamp-2 leading-snug">
                            {order.item_titles.length > 0
                              ? order.item_titles.slice(0, 2).join(", ")
                              : "—"}
                          </p>
                          {order.item_count > 1 && (
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              ×{order.item_count} items
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600 whitespace-nowrap">
                      {order.buyer_name ?? "—"}
                    </td>
                    <td className="px-4 py-3.5 text-right text-xs font-medium text-slate-700 whitespace-nowrap">
                      {formatPrice(order.total_price_cents, order.currency_code)}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                      {formatDeadlineDate(order.expected_ship_date)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ${order.urgency.badgeClass}`}
                      >
                        {order.urgency.level === "overdue" && (
                          <span className="mr-1">⚡</span>
                        )}
                        {order.urgency.level === "critical" && (
                          <span className="mr-1">🔴</span>
                        )}
                        {order.urgency.level === "warning" && (
                          <span className="mr-1">⚠️</span>
                        )}
                        {order.urgency.label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ShopAvatar({
  name,
  iconUrl,
}: {
  name: string;
  iconUrl: string | null;
}) {
  if (iconUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={iconUrl}
        alt={name}
        className="h-6 w-6 rounded-full object-cover ring-1 ring-slate-200"
      />
    );
  }
  return (
    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-600 ring-1 ring-indigo-200">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
  icon,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  icon?: React.ReactNode;
}) {
  return (
    <div className="relative inline-flex items-center">
      {icon && (
        <span className="pointer-events-none absolute left-2.5 text-slate-400">
          {icon}
        </span>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-lg border border-slate-200 bg-white py-1.5 pr-7 text-xs font-medium text-slate-700 shadow-sm hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer pl-7"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 h-3 w-3 text-slate-400" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
        <Package className="h-6 w-6 text-slate-400" strokeWidth={1.5} />
      </div>
      <p className="text-sm font-medium text-slate-600">No orders found</p>
      <p className="text-xs text-slate-400">
        Connect a shop and click &ldquo;Sync Now&rdquo; to load orders.
      </p>
    </div>
  );
}
