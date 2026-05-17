"use client";

import { useState, useMemo, useTransition } from "react";
import { ChevronDown, Package, Store, Clock, Check } from "lucide-react";
import { getUrgencyInfo } from "@/lib/etsy/urgency";
import { useRouter } from "next/navigation";
import OrderCard, { type OrderCardData } from "./OrderCard";

interface Props {
  orders: OrderCardData[];
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
  const router = useRouter();
  const [shopFilter, setShopFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("open");
  const [localShipped, setLocalShipped] = useState<Set<number>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  void isPending;

  async function markShipped(receiptId: number) {
    setLocalShipped((prev) => new Set([...prev, receiptId]));
    try {
      const res = await fetch(`/api/orders/${receiptId}`, { method: "PATCH" });
      if (!res.ok) {
        setLocalShipped((prev) => {
          const next = new Set(prev);
          next.delete(receiptId);
          return next;
        });
      } else {
        startTransition(() => router.refresh());
      }
    } catch {
      setLocalShipped((prev) => {
        const next = new Set(prev);
        next.delete(receiptId);
        return next;
      });
    }
  }

  async function markAllOverdueShipped() {
    const overdueIds = orders
      .filter((o) => {
        if (o.is_shipped || localShipped.has(o.receipt_id)) return false;
        return getUrgencyInfo(o.expected_ship_date, false).level === "overdue";
      })
      .map((o) => o.receipt_id);

    if (overdueIds.length === 0) return;
    setBulkLoading(true);
    setLocalShipped((prev) => new Set([...prev, ...overdueIds]));
    try {
      await Promise.all(
        overdueIds.map((id) => fetch(`/api/orders/${id}`, { method: "PATCH" }))
      );
      startTransition(() => router.refresh());
    } catch {
      setLocalShipped((prev) => {
        const next = new Set(prev);
        overdueIds.forEach((id) => next.delete(id));
        return next;
      });
    } finally {
      setBulkLoading(false);
    }
  }

  const overdueCount = useMemo(
    () =>
      orders.filter((o) => {
        if (o.is_shipped || localShipped.has(o.receipt_id)) return false;
        return getUrgencyInfo(o.expected_ship_date, false).level === "overdue";
      }).length,
    [orders, localShipped]
  );

  const filtered = useMemo(() => {
    return orders
      .filter((o) => shopFilter === "all" || o.shop_id === Number(shopFilter))
      .filter((o) => {
        const shipped = o.is_shipped || localShipped.has(o.receipt_id);
        if (statusFilter === "open") return !shipped;
        if (statusFilter === "shipped") return shipped;
        return true;
      })
      .map((o) => ({
        ...o,
        _urgency: getUrgencyInfo(
          o.expected_ship_date,
          o.is_shipped || localShipped.has(o.receipt_id)
        ),
      }))
      .sort(
        (a, b) =>
          (URGENCY_SORT[a._urgency.level] ?? 5) -
          (URGENCY_SORT[b._urgency.level] ?? 5)
      );
  }, [orders, shopFilter, statusFilter, localShipped]);

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
            ...shops.map((s) => ({
              value: String(s.shop_id),
              label: s.shop_name,
            })),
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

        {overdueCount > 0 && statusFilter === "open" && (
          <button
            onClick={markAllOverdueShipped}
            disabled={bulkLoading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
            {bulkLoading
              ? "Marking…"
              : `Mark all overdue as shipped (${overdueCount})`}
          </button>
        )}
      </div>

      {/* Order cards */}
      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((order) => (
            <OrderCard
              key={order.receipt_id}
              order={order}
              isLocallyShipped={localShipped.has(order.receipt_id)}
              isMarking={
                localShipped.has(order.receipt_id) && !order.is_shipped
              }
              onMarkShipped={markShipped}
            />
          ))}
        </div>
      )}
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
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-16 text-center shadow-sm">
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
