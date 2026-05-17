import { Store, ShieldCheck, TrendingUp } from "lucide-react";
import WaitlistForm from "./WaitlistForm";

const stats = [
  { icon: Store,       value: "20+",   label: "Storefronts synced"  },
  { icon: ShieldCheck, value: "99.9%", label: "Deadline accuracy"   },
  { icon: TrendingUp,  value: "< 30s", label: "Order sync latency"  },
];

const mockOrders = [
  { id: "#4821", shop: "MapleCraft Co.",   item: "Handmade Walnut Box ×1",  deadline: "2h 14m",   urgency: "critical" as const },
  { id: "#4820", shop: "WoodWorks Studio", item: "Custom Cutting Board ×2", deadline: "6h 32m",   urgency: "warning"  as const },
  { id: "#4819", shop: "LaceCraft Designs",item: "Floral Table Runner ×1",  deadline: "14h 05m",  urgency: "ok"       as const },
  { id: "#4818", shop: "ArtisanNest",      item: "Ceramic Mug Set ×3",      deadline: "Tomorrow", urgency: "ok"       as const },
];

const urgency = {
  critical: { dot: "bg-red-400",    text: "text-red-400",    row: "bg-red-500/[0.04]"  },
  warning:  { dot: "bg-amber-400",  text: "text-amber-400",  row: ""                   },
  ok:       { dot: "bg-emerald-400",text: "text-slate-500",  row: ""                   },
};

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-slate-950 pt-24 pb-0 sm:pt-32"
    >
      {/* ── Background layers ─────────────────────────────────── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="bg-dot-grid absolute inset-0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgb(99_102_241/0.18),transparent)]" />
        <div className="absolute -top-32 -left-32 h-[560px] w-[560px] rounded-full bg-indigo-700/10 blur-3xl" />
        <div className="absolute top-10 -right-20 h-[380px] w-[380px] rounded-full bg-violet-700/8 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ── Above-fold copy ───────────────────────────────────── */}
        <div className="mx-auto max-w-3xl text-center">

          {/* Badge */}
          <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-indigo-500/25 bg-indigo-500/8 px-4 py-1.5 text-xs font-medium tracking-wide text-indigo-300 mb-8 select-none">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            Now accepting early access applications
          </div>

          {/* H1 */}
          <h1 className="animate-fade-up animation-delay-100 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-[3.5rem] leading-[1.1]">
            The Ultimate Order Management Hub for{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-400 bg-clip-text text-transparent [background-size:200%_auto] animate-shimmer">
              Multi-Shop Sellers
            </span>
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-up animation-delay-200 mt-6 text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Sync orders, track strict shipping deadlines, and manage fulfillment across{" "}
            <strong className="font-semibold text-slate-200">20+ storefronts</strong>{" "}
            — all from a single, powerful command center.
          </p>

          {/* Waitlist form */}
          <div className="animate-fade-up animation-delay-300 mt-10 mx-auto max-w-xl">
            <WaitlistForm variant="hero" />
          </div>

          {/* Trust stats */}
          <div className="animate-fade-up animation-delay-400 mt-14 grid grid-cols-3 gap-4 sm:gap-6 border-t border-white/8 pt-10">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex flex-col items-center gap-1.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/12 ring-1 ring-indigo-500/20 mb-1">
                  <Icon className="h-[18px] w-[18px] text-indigo-400" strokeWidth={1.75} />
                </div>
                <span className="text-2xl font-bold text-white tabular-nums">{value}</span>
                <span className="text-xs text-slate-500 text-center leading-snug">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Dashboard product mockup ──────────────────────────── */}
        <div className="animate-fade-up animation-delay-500 mt-16 mx-auto max-w-5xl">
          <div className="rounded-t-2xl border border-white/10 border-b-0 bg-slate-900/95 overflow-hidden shadow-[0_-4px_80px_-12px_rgb(99_102_241/0.3)]">

            {/* Window chrome */}
            <div className="flex items-center gap-3 px-5 py-3.5 bg-slate-900 border-b border-white/8">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-slate-700/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-slate-700/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-slate-700/80" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-2 rounded-md bg-slate-800/70 border border-white/5 px-3 py-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-mono text-slate-500 tracking-tight">
                    app.sellersynchub.com — Command Center
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-medium text-slate-600">Live</span>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-3 px-5 py-2.5 border-b border-white/5 bg-slate-900/60">
              <div className="flex gap-0.5">
                {["All Orders", "Urgent", "Shipped"].map((tab, i) => (
                  <span
                    key={tab}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium cursor-pointer transition-colors ${
                      i === 0
                        ? "bg-indigo-600/25 text-indigo-300"
                        : "text-slate-600 hover:text-slate-400"
                    }`}
                  >
                    {tab}
                  </span>
                ))}
              </div>
              <div className="flex-1" />
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-medium text-slate-400">
                  47 pending
                </span>
                <span className="rounded-full bg-red-500/15 border border-red-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-red-400">
                  3 urgent
                </span>
              </div>
            </div>

            {/* Table header */}
            <div className="grid grid-cols-12 gap-2 px-5 py-2 border-b border-white/5 bg-slate-950/50">
              {[
                { label: "Order",    cols: "col-span-2" },
                { label: "Shop",     cols: "col-span-4" },
                { label: "Item",     cols: "col-span-4 hidden sm:block" },
                { label: "Ships by", cols: "col-span-2" },
              ].map(({ label, cols }) => (
                <span
                  key={label}
                  className={`text-[10px] font-semibold uppercase tracking-widest text-slate-600 ${cols}`}
                >
                  {label}
                </span>
              ))}
            </div>

            {/* Order rows */}
            <div className="divide-y divide-white/[0.04]">
              {mockOrders.map((order) => {
                const u = urgency[order.urgency];
                return (
                  <div
                    key={order.id}
                    className={`grid grid-cols-12 gap-2 items-center px-5 py-3.5 text-xs transition-colors hover:bg-white/[0.025] ${u.row}`}
                  >
                    <span className="col-span-2 font-mono text-slate-600 tabular-nums">{order.id}</span>
                    <div className="col-span-4 flex items-center gap-2.5">
                      <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${u.dot}`} />
                      <span className="text-slate-300 font-medium truncate">{order.shop}</span>
                    </div>
                    <span className="col-span-4 hidden sm:block text-slate-500 truncate">{order.item}</span>
                    <span className={`col-span-2 font-semibold tabular-nums ${u.text}`}>{order.deadline}</span>
                  </div>
                );
              })}
            </div>

            {/* Table footer */}
            <div className="flex items-center justify-between px-5 py-3 bg-slate-950/60 border-t border-white/5">
              <span className="text-[11px] text-slate-700">
                43 more orders across 8 shops
              </span>
              <span className="text-[11px] font-medium text-indigo-500 cursor-pointer hover:text-indigo-400 transition-colors">
                View all →
              </span>
            </div>

          </div>
        </div>

      </div>

      {/* Bottom fade into features section */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 to-transparent"
      />
    </section>
  );
}
