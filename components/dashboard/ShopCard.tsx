"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Store, Trash2, ExternalLink, ShoppingBag } from "lucide-react";
import SyncButton from "./SyncButton";

interface Shop {
  shop_id: number;
  shop_name: string;
  shop_title: string | null;
  shop_icon_url: string | null;
  listing_active_count: number;
  connected_at: string;
  last_synced_at: string | null;
  order_count?: number;
}

export default function ShopCard({ shop }: { shop: Shop }) {
  const [disconnecting, setDisconnecting] = useState(false);
  const router = useRouter();

  async function handleDisconnect() {
    if (
      !window.confirm(
        `Disconnect "${shop.shop_name}"? Order history will be preserved.`
      )
    )
      return;

    setDisconnecting(true);
    try {
      const res = await fetch(`/api/shops?shop_id=${shop.shop_id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setDisconnecting(false);
    }
  }

  const lastSynced = shop.last_synced_at
    ? formatRelative(new Date(shop.last_synced_at))
    : "Never";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 transition-colors">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="shrink-0">
          {shop.shop_icon_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shop.shop_icon_url}
              alt={shop.shop_name}
              className="h-12 w-12 rounded-xl object-cover ring-1 ring-slate-200"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 ring-1 ring-indigo-100">
              <Store className="h-6 w-6 text-indigo-500" strokeWidth={1.8} />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-slate-900 truncate">
                {shop.shop_title ?? shop.shop_name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{shop.shop_name}</p>
            </div>
            <a
              href={`https://www.etsy.com/shop/${shop.shop_name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-md p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              title="View on Etsy"
            >
              <ExternalLink className="h-4 w-4" strokeWidth={1.8} />
            </a>
          </div>

          {/* Stats */}
          <div className="mt-3 flex flex-wrap gap-4">
            <Stat
              icon={<ShoppingBag className="h-3.5 w-3.5" />}
              label="Open Orders"
              value={shop.order_count ?? 0}
            />
            <Stat
              icon={<Store className="h-3.5 w-3.5" />}
              label="Active Listings"
              value={shop.listing_active_count}
            />
          </div>

          <p className="mt-2.5 text-[11px] text-slate-400">
            Last synced: <span className="text-slate-500 font-medium">{lastSynced}</span>
            {" · "}
            Connected{" "}
            {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
              new Date(shop.connected_at)
            )}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
        <SyncButton shopId={shop.shop_id} size="sm" />
        <button
          onClick={handleDisconnect}
          disabled={disconnecting}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {disconnecting ? "Disconnecting…" : "Disconnect"}
        </button>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-500">
      <span className="text-slate-400">{icon}</span>
      <span className="font-semibold text-slate-700">{value}</span>
      <span>{label}</span>
    </div>
  );
}

function formatRelative(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}
