"use client";

import { useState } from "react";
import {
  Truck, Copy, CheckCheck, X, StickyNote, MessageSquare,
  Calendar, Check, Package,
} from "lucide-react";
import { getUrgencyInfo, formatDeadlineDate } from "@/lib/etsy/urgency";
import type { StoredTransaction } from "@/lib/etsy/types";

/* ─────────────────────────── types ──────────────────────────── */

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
  tracking_number: string | null;
  shipped_at: string | null;
}

interface Props {
  order: OrderCardData;
  isLocallyShipped: boolean;
  onMarkShipped: (receiptId: number) => void;
  isMarking: boolean;
}

/* ─────────────────────────── constants ──────────────────────── */

const COUNTRY_FLAG: Record<string, string> = {
  GB: "🇬🇧", US: "🇺🇸", CA: "🇨🇦", AU: "🇦🇺",
  DE: "🇩🇪", FR: "🇫🇷", JP: "🇯🇵", NZ: "🇳🇿",
  IE: "🇮🇪", NL: "🇳🇱", SE: "🇸🇪", NO: "🇳🇴",
  DK: "🇩🇰", SG: "🇸🇬", HK: "🇭🇰", MY: "🇲🇾",
};

/* ─────────────────────────── helpers ────────────────────────── */

function formatOrderedDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function formatDispatchDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function buildCopyText(buyerName: string | null, addr: ShipAddress | null): string {
  const lines: string[] = [];
  if (buyerName) lines.push(buyerName);
  if (addr?.first_line) lines.push(addr.first_line);
  if (addr?.second_line) lines.push(addr.second_line);
  const cityLine = [addr?.city, addr?.state, addr?.zip].filter(Boolean).join(", ");
  if (cityLine) lines.push(cityLine);
  if (addr?.country_iso) lines.push(addr.country_iso);
  return lines.join("\n");
}

/* ─────────────────────────── sub-components ─────────────────── */

function ProductImage({ url, title }: { url: string | null; title: string }) {
  const [err, setErr] = useState(false);

  if (url && !err) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt={title} className="w-full h-full object-cover"
        onError={() => setErr(true)} />
    );
  }

  const gradients = [
    "from-violet-400 to-purple-600", "from-pink-400 to-rose-600",
    "from-blue-400 to-indigo-600",   "from-teal-400 to-emerald-600",
    "from-orange-400 to-amber-600",
  ];
  const gradient = gradients[title.charCodeAt(0) % gradients.length];
  const initial = title.replace(/[^a-zA-Z]/g, "").charAt(0).toUpperCase() || "?";

  return (
    <div className={`w-full h-full bg-linear-to-br ${gradient} flex items-center justify-center`}>
      <span className="text-white font-bold text-base select-none">{initial}</span>
    </div>
  );
}

/* ─────────────────────── CompleteOrderModal ─────────────────── */

interface ModalProps {
  order: OrderCardData;
  onClose: () => void;
  onComplete: (receiptId: number) => void;
}

function CompleteOrderModal({ order, onClose, onComplete }: ModalProps) {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [noteToBuyer, setNoteToBuyer] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const todayLabel = new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const addr = order.ship_address;
  const cityLine = [addr?.city, addr?.state].filter(Boolean).join(", ");
  const countryIso = order.ship_country_iso ?? addr?.country_iso ?? null;
  const flag = countryIso ? (COUNTRY_FLAG[countryIso] ?? "") : "";

  async function handleComplete() {
    setApiError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${order.receipt_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tracking_number: trackingNumber || null,
          carrier: "4PX",
          note_to_buyer: noteToBuyer || null,
        }),
      });
      if (res.ok) {
        onComplete(order.receipt_id);
        onClose();
      } else {
        const data = await res.json().catch(() => ({}));
        setApiError((data as { error?: string }).error ?? "Failed. Please try again.");
      }
    } catch {
      setApiError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  /* Close on backdrop click */
  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdrop}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* ── Modal header ── */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-[17px] font-semibold text-gray-900 leading-tight">
              Complete order
            </h2>
            <p className="text-[13px] text-gray-500 mt-1 leading-snug max-w-xs">
              Make sure the carrier receives this order by the dispatch date.
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 mt-0.5 rounded-full p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Modal body ── */}
        <div className="px-6 py-5 space-y-5">

          {/* Dispatch date */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">
              Dispatch date
            </label>
            <div className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5">
              <Calendar className="h-4 w-4 shrink-0 text-gray-400" strokeWidth={1.8} />
              <span className="text-sm font-medium text-gray-700">{todayLabel}</span>
            </div>
          </div>

          {/* Order summary card */}
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            {/* Shop / buyer row */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50/70 border-b border-gray-100">
              <div className="flex items-center gap-2 min-w-0">
                {order.shop_icon_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={order.shop_icon_url} alt={order.shop_name}
                    className="h-5 w-5 rounded-full object-cover ring-1 ring-gray-200 shrink-0" />
                ) : (
                  <div className="h-5 w-5 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <span className="text-[9px] font-bold text-indigo-600">
                      {order.shop_name.charAt(0)}
                    </span>
                  </div>
                )}
                <span className="text-sm font-semibold text-gray-800 truncate">{order.shop_name}</span>
              </div>
              <span className="text-xs text-gray-400 shrink-0 ml-2">
                {flag} {order.buyer_name ?? "—"}
                {cityLine ? ` · ${cityLine}` : ""}
              </span>
            </div>

            {/* Delivery fields */}
            <div className="px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
                Delivery details
              </p>
              <div className="grid grid-cols-2 gap-3">
                {/* Carrier — fixed, display only */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Delivery company</label>
                  <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 cursor-not-allowed">
                    <span>Other (4PX)</span>
                    <span className="text-gray-300 text-xs">▼</span>
                  </div>
                </div>

                {/* Tracking number */}
                <div>
                  <label htmlFor="tracking-input" className="block text-xs text-gray-500 mb-1">
                    Tracking number
                  </label>
                  <input
                    id="tracking-input"
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. 4PX12345678"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors"
                    autoFocus
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Note to buyer */}
          <div>
            <label htmlFor="note-input" className="block text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">
              Note to buyer <span className="text-gray-300 font-normal normal-case tracking-normal">(optional)</span>
            </label>
            <textarea
              id="note-input"
              value={noteToBuyer}
              onChange={(e) => setNoteToBuyer(e.target.value)}
              placeholder="Add a note that will be included in the dispatch email…"
              rows={2}
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors"
            />
          </div>

          {apiError && (
            <p className="text-xs text-red-500 font-medium">{apiError}</p>
          )}
        </div>

        {/* ── Modal footer ── */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleComplete}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Completing…
              </>
            ) : (
              <>
                <Truck className="h-3.5 w-3.5" strokeWidth={2} />
                Complete order
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── OrderCard ──────────────────────── */

export default function OrderCard({ order, isLocallyShipped, onMarkShipped, isMarking }: Props) {
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const isShipped = order.is_shipped || isLocallyShipped;
  const urgency = getUrgencyInfo(order.expected_ship_date, isShipped);
  const countryIso = order.ship_country_iso ?? order.ship_address?.country_iso ?? null;
  const isUK = countryIso === "GB";
  const flag = countryIso ? (COUNTRY_FLAG[countryIso] ?? "") : "";
  const addr = order.ship_address;
  const cityLine = [addr?.city, addr?.state].filter(Boolean).join(", ");

  async function copyAddress() {
    const text = buildCopyText(order.buyer_name, addr);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  }

  /* ── urgency accent bar ── */
  const ACCENT: Record<string, string> = {
    overdue: "border-l-red-500",
    critical: "border-l-orange-500",
    warning: "border-l-amber-400",
    ok: "border-l-indigo-400",
    shipped: "border-l-gray-200",
  };
  const accentClass = ACCENT[urgency.level] ?? ACCENT.ok;

  /* ── urgency badge ── */
  const BADGE: Record<string, string> = {
    overdue: "bg-red-50 text-red-600 ring-1 ring-red-200",
    critical: "bg-orange-50 text-orange-600 ring-1 ring-orange-200",
    warning: "bg-amber-50 text-amber-600 ring-1 ring-amber-200",
    ok: "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200",
    shipped: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200",
  };
  const badgeClass = BADGE[isShipped ? "shipped" : urgency.level] ?? BADGE.ok;

  return (
    <>
      <div
        className={`
          border-l-4 ${accentClass} rounded-r-xl border border-l-0 bg-white
          shadow-sm hover:shadow-md transition-all duration-150
          ${isShipped ? "opacity-60" : ""}
        `}
      >
        {/* ══ Header row: "Ordered [date] · N item(s)"  ══════════ */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50/80 border-b border-gray-100">
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Shop icon + name */}
            <div className="flex items-center gap-1.5">
              {order.shop_icon_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={order.shop_icon_url} alt={order.shop_name}
                  className="h-4 w-4 rounded-full object-cover ring-1 ring-gray-200 shrink-0" />
              ) : (
                <div className="h-4 w-4 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <span className="text-[8px] font-bold text-indigo-600">{order.shop_name.charAt(0)}</span>
                </div>
              )}
              <span className="text-xs font-semibold text-gray-700">{order.shop_name}</span>
            </div>

            <span className="h-3 w-px bg-gray-200" />
            <span className="font-mono text-[11px] text-gray-400">#{order.receipt_id}</span>
            <span className="h-3 w-px bg-gray-200" />
            <span className="text-[11px] text-gray-400">
              Ordered {formatOrderedDate(order.etsy_created_at)}
              {" · "}
              {order.item_count} item{order.item_count !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Status badge */}
          <span className={`shrink-0 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${badgeClass}`}>
            {isShipped ? "Shipped ✓" : urgency.label}
          </span>
        </div>

        {/* ══ Body: product(left) | shipping(right) | action(far right) ══ */}
        <div className="flex items-stretch divide-x divide-gray-100">

          {/* ── LEFT: product list ── */}
          <div className="flex-1 min-w-0 py-4 px-4 space-y-3.5">
            {(order.transactions.length > 0 ? order.transactions : [{
              transaction_id: 0,
              listing_id: null,
              title: order.item_titles[0] ?? "—",
              quantity: order.item_count,
              image_url: null,
              variations: [],
            }]).map((t) => (
              <div key={t.transaction_id} className="flex gap-3 items-start">
                {/* Thumbnail */}
                <div className="shrink-0 w-[68px] h-[68px] rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                  <ProductImage url={t.image_url} title={t.title} />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-[13px] font-semibold text-gray-900 leading-snug line-clamp-2">
                    {t.title}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">Quantity {t.quantity}</p>

                  {t.variations.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {t.variations.map((v, i) => (
                        <span key={i} className="text-xs text-gray-600">
                          <span className="text-gray-400">{v.name} </span>
                          <span className="font-semibold text-gray-700">{v.value}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ── RIGHT: shipping + delivery ── */}
          <div className="w-52 shrink-0 py-4 px-4">
            <div className="space-y-3.5">

              {/* Dispatches by */}
              {!isShipped && order.expected_ship_date && (
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-widest text-gray-400">
                    Dispatches by
                  </p>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">
                    {formatDispatchDate(order.expected_ship_date)}
                  </p>
                </div>
              )}

              {/* Shipped at / tracking */}
              {isShipped && (
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-widest text-gray-400">
                    Dispatched
                  </p>
                  {order.tracking_number ? (
                    <p className="text-xs font-semibold text-emerald-600 mt-0.5">
                      4PX · {order.tracking_number}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {order.shipped_at ? formatOrderedDate(order.shipped_at) : "—"}
                    </p>
                  )}
                </div>
              )}

              <div className="border-t border-gray-100" />

              {/* Deliver to — click to copy */}
              <button
                onClick={copyAddress}
                title="Click to copy address"
                className="group w-full text-left rounded-lg -mx-1 px-1 py-1 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-semibold uppercase tracking-widest text-gray-400">
                    Deliver to
                  </p>
                  {copied ? (
                    <CheckCheck className="h-3 w-3 text-emerald-500" strokeWidth={2} />
                  ) : (
                    <Copy className="h-2.5 w-2.5 text-gray-200 group-hover:text-gray-400 transition-colors" strokeWidth={2} />
                  )}
                </div>
                <p className="text-[13px] font-semibold text-gray-800 mt-0.5 leading-tight">
                  {flag && <span className="mr-1">{flag}</span>}
                  {order.buyer_name ?? "—"}
                </p>
                {cityLine && (
                  <p className="text-xs text-gray-500 mt-0.5">{cityLine}</p>
                )}
                {addr?.first_line && (
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">
                    {addr.first_line}
                    {addr.second_line ? `, ${addr.second_line}` : ""}
                  </p>
                )}
                {copied && (
                  <p className="text-[10px] font-semibold text-emerald-500 mt-1">Copied!</p>
                )}
              </button>
            </div>
          </div>

          {/* ── FAR RIGHT: action ── */}
          <div className="w-14 shrink-0 flex flex-col items-center justify-center py-4 px-1 gap-2">
            {!isShipped && !isMarking ? (
              <button
                onClick={() => setShowModal(true)}
                title="Complete order"
                className="group flex flex-col items-center gap-1 p-2.5 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
              >
                <Truck className="h-5 w-5" strokeWidth={1.8} />
                <span className="text-[9px] font-semibold uppercase tracking-wide leading-none">Ship</span>
              </button>
            ) : isMarking ? (
              <div className="p-2.5 text-emerald-500">
                <Check className="h-5 w-5" strokeWidth={2.5} />
              </div>
            ) : (
              <div className="p-2.5 text-emerald-400" title="Shipped">
                <Package className="h-5 w-5" strokeWidth={1.8} />
              </div>
            )}
          </div>
        </div>

        {/* ══ Notices: UK VAT / seller note / buyer message ══════ */}
        {(isUK || order.seller_note || order.buyer_message) && !isShipped && (
          <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-2.5">

            {isUK && (
              <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-200/70 px-3.5 py-3">
                <span className="shrink-0 text-[15px] leading-none mt-0.5">🇬🇧</span>
                <div>
                  <p className="text-xs font-bold text-amber-800">UK VAT — write on package</p>
                  <p className="mt-0.5 text-[11px] text-amber-700 leading-relaxed">
                    Include Etsy&apos;s UK VAT number <strong>370 6004 28</strong> on the outside.
                    The buyer won&apos;t be charged twice.
                  </p>
                </div>
              </div>
            )}

            {order.seller_note && (
              <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-3">
                <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" strokeWidth={1.8} />
                <div className="min-w-0">
                  <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Private note</p>
                  <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">{order.seller_note}</p>
                </div>
              </div>
            )}

            {order.buyer_message && (
              <div className="flex items-start gap-2.5 rounded-xl bg-indigo-50 border border-indigo-100 px-3.5 py-3">
                <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-400" strokeWidth={1.8} />
                <div className="min-w-0">
                  <p className="text-[9px] font-semibold uppercase tracking-widest text-indigo-400 mb-1">Note from buyer</p>
                  <p className="text-xs text-indigo-700 whitespace-pre-wrap leading-relaxed">{order.buyer_message}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Complete Order Modal */}
      {showModal && (
        <CompleteOrderModal
          order={order}
          onClose={() => setShowModal(false)}
          onComplete={(id) => {
            onMarkShipped(id);
            setShowModal(false);
          }}
        />
      )}
    </>
  );
}
