"use client";

import { useState } from "react";
import { MapPin, MessageSquare, StickyNote, Check } from "lucide-react";
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

const URGENCY_ACCENT: Record<string, string> = {
  overdue:  "border-l-red-500",
  critical: "border-l-orange-500",
  warning:  "border-l-amber-400",
  ok:       "border-l-indigo-500",
  shipped:  "border-l-slate-300",
};

const COUNTRY_FLAG: Record<string, string> = {
  GB: "🇬🇧", US: "🇺🇸", CA: "🇨🇦", AU: "🇦🇺",
  DE: "🇩🇪", FR: "🇫🇷", JP: "🇯🇵", NZ: "🇳🇿",
  IE: "🇮🇪", NL: "🇳🇱", SE: "🇸🇪", NO: "🇳🇴",
  DK: "🇩🇰", SG: "🇸🇬", HK: "🇭🇰", MY: "🇲🇾",
};

function formatOrderedDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function ProductImage({ url, title }: { url: string | null; title: string }) {
  const [err, setErr] = useState(false);

  if (url && !err) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={title}
        className="w-full h-full object-cover"
        onError={() => setErr(true)}
      />
    );
  }

  // Gradient placeholder with product initial
  const initial = title.replace(/[^a-zA-Z]/g, "").charAt(0).toUpperCase() || "?";
  const gradients = [
    "from-violet-400 to-purple-600",
    "from-pink-400 to-rose-600",
    "from-blue-400 to-indigo-600",
    "from-teal-400 to-emerald-600",
    "from-orange-400 to-amber-600",
  ];
  const gradient = gradients[title.charCodeAt(0) % gradients.length];

  return (
    <div className={`w-full h-full bg-linear-to-br ${gradient} flex items-center justify-center`}>
      <span className="text-white font-bold text-lg select-none">{initial}</span>
    </div>
  );
}

export default function OrderCard({ order, isLocallyShipped, onMarkShipped, isMarking }: Props) {
  const isShipped = order.is_shipped || isLocallyShipped;
  const urgency = getUrgencyInfo(order.expected_ship_date, isShipped);
  const countryIso = order.ship_country_iso ?? order.ship_address?.country_iso ?? null;
  const isUK = countryIso === "GB";
  const flag = countryIso ? (COUNTRY_FLAG[countryIso] ?? "") : "";
  const accentClass = URGENCY_ACCENT[urgency.level] ?? URGENCY_ACCENT.ok;

  const hasBadgeIcon = !isShipped && (urgency.level === "overdue" || urgency.level === "critical" || urgency.level === "warning");

  return (
    <div
      className={`
        relative rounded-xl border border-slate-200 bg-white shadow-sm
        border-l-4 ${accentClass}
        ${isShipped ? "opacity-55" : ""}
        transition-all duration-200 hover:shadow-md
      `}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5 min-w-0 overflow-hidden">
          {order.shop_icon_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={order.shop_icon_url}
              alt={order.shop_name}
              className="h-5 w-5 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
            />
          ) : (
            <div className="h-5 w-5 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
              <span className="text-[9px] font-bold text-indigo-600">
                {order.shop_name.charAt(0)}
              </span>
            </div>
          )}

          <span className="text-xs font-semibold text-slate-700 truncate shrink-0">
            {order.shop_name}
          </span>

          <span className="h-3.5 w-px bg-slate-200 shrink-0" />

          <span className="font-mono text-xs font-medium text-slate-500 shrink-0">
            #{order.receipt_id}
          </span>

          <span className="h-3.5 w-px bg-slate-200 shrink-0" />

          <span className="text-xs text-slate-400 shrink-0">
            {formatOrderedDate(order.etsy_created_at)}
          </span>
        </div>

        {/* Urgency / shipped badge */}
        <span
          className={`
            shrink-0 inline-flex items-center gap-1 rounded-full
            px-2.5 py-1 text-[11px] font-semibold tracking-wide
            ${urgency.badgeClass}
          `}
        >
          {hasBadgeIcon && urgency.level === "overdue"  && <span className="text-[10px]">⚡</span>}
          {hasBadgeIcon && urgency.level === "critical" && <span className="text-[10px]">●</span>}
          {hasBadgeIcon && urgency.level === "warning"  && <span className="text-[10px]">▲</span>}
          {isShipped ? "Shipped" : urgency.label}
        </span>
      </div>

      {/* ── Product(s) ── */}
      <div className="px-5 py-4 space-y-4">
        {order.transactions.length > 0 ? (
          order.transactions.map((t) => (
            <div key={t.transaction_id} className="flex gap-4 items-start">
              {/* Product image */}
              <div className="shrink-0 w-[72px] h-[72px] rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-slate-100">
                <ProductImage url={t.image_url} title={t.title} />
              </div>

              {/* Product info */}
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2">
                  {t.title}
                </p>

                {t.variations.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {t.variations.map((v, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium"
                      >
                        <span className="text-slate-400">{v.name}:</span>
                        <span className="text-slate-700">{v.value}</span>
                      </span>
                    ))}
                  </div>
                )}

                <p className="mt-1.5 text-[11px] text-slate-400 font-medium">
                  Qty {t.quantity}
                </p>
              </div>
            </div>
          ))
        ) : (
          /* Fallback for orders synced before transactions_json was added */
          <div className="flex gap-4 items-start">
            <div className="shrink-0 w-[72px] h-[72px] rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-slate-100">
              <ProductImage url={null} title={order.item_titles[0] ?? ""} />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2">
                {order.item_titles[0] ?? "—"}
              </p>
              <p className="mt-1.5 text-[11px] text-slate-400 font-medium">
                {order.item_count} item{order.item_count !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Divider ── */}
      <div className="mx-5 border-t border-slate-100" />

      {/* ── Delivery row ── */}
      <div className="px-5 py-4 flex items-start justify-between gap-6">
        {/* Buyer + address */}
        <div className="flex items-start gap-2.5 min-w-0">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" strokeWidth={1.8} />
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800">
              {flag && <span className="mr-1.5">{flag}</span>}
              {order.buyer_name ?? "—"}
            </p>
            {order.ship_address && (
              <div className="mt-0.5 space-y-px">
                {order.ship_address.first_line && (
                  <p className="text-xs text-slate-500">
                    {order.ship_address.first_line}
                    {order.ship_address.second_line ? `, ${order.ship_address.second_line}` : ""}
                  </p>
                )}
                <p className="text-xs text-slate-500">
                  {[
                    order.ship_address.city,
                    order.ship_address.state,
                    order.ship_address.zip,
                  ].filter(Boolean).join(", ")}
                </p>
                {countryIso && (
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                    {countryIso}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Ship-by date */}
        {!isShipped && order.expected_ship_date && (
          <div className="shrink-0 text-right">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-0.5">
              Dispatches by
            </p>
            <p className="text-sm font-bold text-slate-800">
              {formatDeadlineDate(order.expected_ship_date)}
            </p>
          </div>
        )}
      </div>

      {/* ── Notices & Notes ── */}
      {(isUK || order.seller_note || order.buyer_message) && !isShipped && (
        <div className="px-5 pb-4 space-y-2">

          {/* UK VAT */}
          {isUK && (
            <div className="flex items-start gap-2.5 rounded-lg bg-amber-50 border border-amber-200/80 px-3.5 py-3">
              <span className="shrink-0 text-base leading-none">🇬🇧</span>
              <div>
                <p className="text-xs font-bold text-amber-800">
                  UK VAT — write on package
                </p>
                <p className="mt-0.5 text-[11px] text-amber-700 leading-relaxed">
                  Include Etsy&apos;s UK VAT number{" "}
                  <strong className="font-bold">370 6004 28</strong> on the outside of
                  the package. This ensures the buyer isn&apos;t charged VAT twice.
                </p>
              </div>
            </div>
          )}

          {/* Seller private note */}
          {order.seller_note && (
            <div className="flex items-start gap-2.5 rounded-lg bg-slate-50 border border-slate-200 px-3.5 py-3">
              <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" strokeWidth={1.8} />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">
                  Private note
                </p>
                <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">
                  {order.seller_note}
                </p>
              </div>
            </div>
          )}

          {/* Buyer message */}
          {order.buyer_message && (
            <div className="flex items-start gap-2.5 rounded-lg bg-indigo-50 border border-indigo-100 px-3.5 py-3">
              <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-400" strokeWidth={1.8} />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-indigo-400 mb-1">
                  Note from buyer
                </p>
                <p className="text-xs text-indigo-700 whitespace-pre-wrap leading-relaxed">
                  {order.buyer_message}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Footer ── */}
      {!isShipped && (
        <div className="px-5 pb-4 flex justify-end">
          {isMarking ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
              Marked as shipped
            </span>
          ) : (
            <button
              onClick={() => onMarkShipped(order.receipt_id)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 active:scale-95 transition-all duration-150"
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
