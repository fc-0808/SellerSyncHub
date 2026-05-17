"use client";

import { useState } from "react";
import {
  MapPin,
  MessageSquare,
  StickyNote,
  AlertCircle,
  Check,
  Store,
  Calendar,
} from "lucide-react";
import { getUrgencyInfo, formatDeadlineDate } from "@/lib/etsy/urgency";
import type { StoredTransaction } from "@/lib/etsy/types";

interface ShipAddress {
  first_line: string | null;
  second_line: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country_iso: string | null;
  formatted: string | null;
}

export interface OrderCardData {
  receipt_id: number;
  shop_id: number;
  shop_name: string;
  shop_icon_url: string | null;
  buyer_name: string | null;
  ship_address: ShipAddress | null;
  ship_country_iso: string | null;
  buyer_message: string | null;
  seller_note: string | null;
  item_count: number;
  item_titles: string[];
  transactions: StoredTransaction[];
  expected_ship_date: string | null;
  etsy_created_at: string | null;
  is_shipped: boolean;
  receipt_state: string;
}

interface Props {
  order: OrderCardData;
  isLocallyShipped: boolean;
  onMarkShipped: (receiptId: number) => void;
  isMarking: boolean;
}

const COUNTRY_FLAG: Record<string, string> = {
  GB: "🇬🇧",
  US: "🇺🇸",
  CA: "🇨🇦",
  AU: "🇦🇺",
  DE: "🇩🇪",
  FR: "🇫🇷",
  JP: "🇯🇵",
  NZ: "🇳🇿",
  IE: "🇮🇪",
  NL: "🇳🇱",
  SE: "🇸🇪",
  NO: "🇳🇴",
  DK: "🇩🇰",
  SG: "🇸🇬",
  HK: "🇭🇰",
  MY: "🇲🇾",
};

function formatOrderedDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function buildAddressLine(addr: ShipAddress): string {
  const parts = [
    addr.city,
    addr.state,
    addr.country_iso,
  ].filter(Boolean);
  return parts.join(", ");
}

export default function OrderCard({ order, isLocallyShipped, onMarkShipped, isMarking }: Props) {
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());
  const isShipped = order.is_shipped || isLocallyShipped;
  const urgency = getUrgencyInfo(order.expected_ship_date, isShipped);
  const countryIso = order.ship_country_iso ?? order.ship_address?.country_iso ?? null;
  const isUK = countryIso === "GB";
  const flag = countryIso ? (COUNTRY_FLAG[countryIso] ?? "🌍") : null;

  return (
    <div
      className={`rounded-xl border bg-white shadow-sm overflow-hidden transition-opacity ${
        isShipped ? "opacity-60" : ""
      } ${urgency.rowClass ?? ""}`}
    >
      {/* ── Header row ── */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50/60">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Shop avatar */}
          {order.shop_icon_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={order.shop_icon_url}
              alt={order.shop_name}
              className="h-6 w-6 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
            />
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-600 ring-1 ring-indigo-200 shrink-0">
              {order.shop_name.charAt(0)}
            </div>
          )}
          <span className="text-xs font-semibold text-slate-700 truncate">
            {order.shop_name}
          </span>
          <span className="text-slate-300 text-xs">·</span>
          <span className="font-mono text-xs text-slate-500">
            #{order.receipt_id}
          </span>
          <span className="text-slate-300 text-xs">·</span>
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Calendar className="h-3 w-3 shrink-0" strokeWidth={1.8} />
            {formatOrderedDate(order.etsy_created_at)}
          </span>
        </div>

        {/* Urgency badge */}
        <span
          className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${urgency.badgeClass}`}
        >
          {urgency.level === "overdue" && <span>⚡</span>}
          {urgency.level === "critical" && <span>🔴</span>}
          {urgency.level === "warning" && <span>⚠️</span>}
          {isShipped ? "Shipped" : urgency.label}
        </span>
      </div>

      {/* ── Products ── */}
      <div className="divide-y divide-slate-50 px-4 pt-3 pb-3">
        {order.transactions.length > 0 ? (
          order.transactions.map((t) => (
            <div key={t.transaction_id} className="flex gap-3 py-2.5 first:pt-0 last:pb-0">
              {/* Product image */}
              <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                {t.image_url && !imgErrors.has(t.transaction_id) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={t.image_url}
                    alt={t.title}
                    className="w-full h-full object-cover"
                    onError={() =>
                      setImgErrors((prev) => new Set([...prev, t.transaction_id]))
                    }
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Store className="h-6 w-6 text-slate-300" strokeWidth={1.5} />
                  </div>
                )}
              </div>

              {/* Product details */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 leading-snug line-clamp-2">
                  {t.title}
                </p>
                {t.variations.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {t.variations.map((v, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                      >
                        <span className="text-slate-400 mr-1">{v.name}:</span>
                        {v.value}
                      </span>
                    ))}
                  </div>
                )}
                <p className="mt-1 text-[11px] text-slate-400">
                  Qty {t.quantity}
                </p>
              </div>
            </div>
          ))
        ) : (
          /* Fallback when transactions_json not yet populated (pre-resync orders) */
          <div className="py-2">
            <p className="text-sm text-slate-600 line-clamp-2">
              {order.item_titles.slice(0, 2).join(", ") || "—"}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {order.item_count} item{order.item_count !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>

      {/* ── Address + Ship By ── */}
      {(order.buyer_name || order.ship_address) && (
        <div className="px-4 py-3 border-t border-slate-100 flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-2 min-w-0">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" strokeWidth={1.8} />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800">
                {flag && <span className="mr-1">{flag}</span>}
                {order.buyer_name ?? "—"}
              </p>
              {order.ship_address && (
                <>
                  {order.ship_address.first_line && (
                    <p className="text-xs text-slate-500">
                      {order.ship_address.first_line}
                      {order.ship_address.second_line
                        ? `, ${order.ship_address.second_line}`
                        : ""}
                    </p>
                  )}
                  <p className="text-xs text-slate-500">
                    {buildAddressLine(order.ship_address)}
                  </p>
                </>
              )}
            </div>
          </div>

          {!isShipped && order.expected_ship_date && (
            <div className="shrink-0 text-right">
              <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">
                Dispatches by
              </p>
              <p className="text-sm font-bold text-slate-700">
                {formatDeadlineDate(order.expected_ship_date)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── UK VAT notice ── */}
      {isUK && !isShipped && (
        <div className="mx-4 mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" strokeWidth={1.8} />
            <div className="text-xs text-amber-800 space-y-0.5">
              <p className="font-semibold">UK VAT — write on package</p>
              <p>
                Include Etsy&apos;s UK VAT number <strong>370 6004 28</strong> on the
                outside of the package. This ensures the buyer isn&apos;t charged VAT
                twice.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Seller note ── */}
      {order.seller_note && (
        <div className="mx-4 mb-3 flex items-start gap-2 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2.5">
          <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-500" strokeWidth={1.8} />
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wide font-semibold text-indigo-400 mb-0.5">
              Private note
            </p>
            <p className="text-xs text-indigo-800 whitespace-pre-wrap">{order.seller_note}</p>
          </div>
        </div>
      )}

      {/* ── Buyer message ── */}
      {order.buyer_message && (
        <div className="mx-4 mb-3 flex items-start gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2.5">
          <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" strokeWidth={1.8} />
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wide font-semibold text-emerald-500 mb-0.5">
              Note from buyer
            </p>
            <p className="text-xs text-emerald-800 whitespace-pre-wrap">{order.buyer_message}</p>
          </div>
        </div>
      )}

      {/* ── Footer actions ── */}
      {!isShipped && (
        <div className="px-4 py-2.5 border-t border-slate-100 flex justify-end">
          {isMarking ? (
            <span className="text-xs font-semibold text-emerald-600">✓ Marked as shipped</span>
          ) : (
            <button
              onClick={() => onMarkShipped(order.receipt_id)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
            >
              <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
              Mark as Shipped
            </button>
          )}
        </div>
      )}
    </div>
  );
}
