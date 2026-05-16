import { Store, ShieldCheck, TrendingUp } from "lucide-react";
import WaitlistForm from "./WaitlistForm";

const stats = [
  { icon: Store, value: "20+", label: "Storefronts synced" },
  { icon: ShieldCheck, value: "99.9%", label: "Deadline accuracy" },
  { icon: TrendingUp, value: "< 30s", label: "Order sync latency" },
];

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-slate-950 pt-24 pb-20 sm:pt-32 sm:pb-28"
    >
      {/* Background gradient blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-indigo-700/20 blur-3xl" />
        <div className="absolute top-20 right-0 h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-violet-700/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-300 mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Now accepting early access applications
          </div>

          {/* H1 */}
          <h1 className="animate-fade-up animation-delay-100 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1]">
            The Ultimate Order Management Hub for{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Multi-Shop Sellers
            </span>
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-up animation-delay-200 mt-6 text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Sync orders, track strict shipping deadlines, and manage fulfillment
            across{" "}
            <strong className="font-semibold text-slate-200">
              20+ storefronts
            </strong>{" "}
            seamlessly — all from a single, powerful command center.
          </p>

          {/* Waitlist form */}
          <div className="animate-fade-up animation-delay-300 mt-10 mx-auto max-w-xl">
            <WaitlistForm variant="hero" />
          </div>

          {/* Trust indicators */}
          <div className="animate-fade-up animation-delay-400 mt-14 grid grid-cols-3 gap-4 sm:gap-8 border-t border-white/10 pt-10">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex flex-col items-center gap-1.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/15 mb-1">
                  <Icon className="h-4.5 w-4.5 text-indigo-400" strokeWidth={1.75} />
                </div>
                <span className="text-2xl font-bold text-white">{value}</span>
                <span className="text-xs text-slate-500 text-center">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
