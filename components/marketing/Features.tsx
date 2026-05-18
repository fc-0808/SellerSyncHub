import {
  Store,
  LayoutDashboard,
  Gauge,
  ShieldCheck,
  Zap,
  BarChart3,
  ArrowRight,
} from "lucide-react";

const primaryFeatures = [
  {
    icon: Store,
    number: "01",
    title: "Multi-Storefront Integration",
    description:
      "Securely authenticate and connect up to 20 unique Etsy storefronts using industry-standard OAuth 2.0. Manage your entire portfolio without constantly logging in and out.",
    accentColor: "before:bg-indigo-500",
    iconRing: "ring-indigo-100 bg-indigo-50 text-indigo-600",
  },
  {
    icon: LayoutDashboard,
    number: "02",
    title: "Unified Fulfillment Dashboard",
    description:
      "Aggregate your unshipped orders into a single, lightning-fast operational cache. Filter by shipping deadlines, track fulfillment workflows, and automatically clear out ghost orders.",
    accentColor: "before:bg-violet-500",
    iconRing: "ring-violet-100 bg-violet-50 text-violet-600",
  },
  {
    icon: Gauge,
    number: "03",
    title: "High-Performance Syncing",
    description:
      "Built for scale and reliability. SellerSyncHub utilizes intelligent queueing, image caching, and rate-limit protection to ensure continuous, reliable order syncing across all your shops.",
    accentColor: "before:bg-emerald-500",
    iconRing: "ring-emerald-100 bg-emerald-50 text-emerald-600",
  },
];

const secondaryFeatures = [
  {
    icon: ShieldCheck,
    title: "Rate-Limit Protection",
    description:
      "Sequential request queuing with exponential back-off keeps every sync safely within Etsy's API quota.",
  },
  {
    icon: Zap,
    title: "Deadline Urgency Engine",
    description:
      "Every order is scored by shipping urgency the moment it syncs — overdue, at-risk, or on track.",
  },
  {
    icon: BarChart3,
    title: "Fulfillment Analytics",
    description:
      "Track dispatch rates, on-time shipping performance, and shop-level KPIs across your entire portfolio.",
  },
];

export default function Features() {
  return (
    <section id="features" className="relative bg-slate-50 py-24 sm:py-32">
      {/* Subtle dot-grid background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-dot-grid-light" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 mb-3">
            Platform capabilities
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Professional-grade infrastructure for serious Etsy operations
          </h2>
          <p className="mt-4 text-lg text-slate-500 leading-relaxed">
            Built for high-volume merchants who manage multiple storefronts and
            can&apos;t afford to miss a deadline or lose visibility across their portfolio.
          </p>
        </div>

        {/* Primary feature cards */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {primaryFeatures.map(({ icon: Icon, number, title, description, accentColor, iconRing }) => (
            <div
              key={title}
              className={`group relative rounded-2xl border border-slate-200 bg-white p-8 overflow-hidden
                transition-all duration-200
                hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/70 hover:-translate-y-0.5
                before:absolute before:inset-x-0 before:top-0 before:h-[3px]
                before:scale-x-0 before:origin-left before:transition-transform before:duration-300
                group-hover:before:scale-x-100 ${accentColor}`}
            >
              {/* Number watermark */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-1 top-3 text-[80px] font-black leading-none select-none text-slate-100 transition-colors duration-200 group-hover:text-indigo-50"
              >
                {number}
              </span>

              <div
                className={`relative inline-flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${iconRing}`}
              >
                <Icon className="h-5 w-5" strokeWidth={2} />
              </div>

              <h3 className="relative mt-5 text-[17px] font-semibold text-slate-900">
                {title}
              </h3>
              <p className="relative mt-2.5 text-sm leading-relaxed text-slate-500">
                {description}
              </p>

              <div className="relative mt-5 flex items-center gap-1 text-sm font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Learn more
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </div>
            </div>
          ))}
        </div>

        {/* Secondary feature strip */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {secondaryFeatures.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group flex items-start gap-4 rounded-xl border border-slate-200/80 bg-white/80 px-6 py-5
                hover:border-indigo-200/80 hover:bg-indigo-50/40 transition-all duration-200"
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors duration-200">
                <Icon className="h-4 w-4" strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{title}</p>
                <p className="mt-1 text-sm text-slate-500 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
