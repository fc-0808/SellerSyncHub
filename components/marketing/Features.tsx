import {
  GitMerge,
  LayoutDashboard,
  ShieldAlert,
  Zap,
  Bell,
  BarChart3,
} from "lucide-react";

const primaryFeatures = [
  {
    icon: GitMerge,
    title: "Multi-Shop Sync",
    description:
      "Unified, secure OAuth 2.0 authentication across all your storefronts. Connect unlimited shops in minutes — no manual exports, no CSV headaches.",
    color: "indigo",
  },
  {
    icon: LayoutDashboard,
    title: "Command Center",
    description:
      "Aggregated orders view with advanced sorting and filtering by fulfillment urgency. Every open order, ranked by what needs your attention first.",
    color: "violet",
  },
  {
    icon: ShieldAlert,
    title: "Deadline Guard",
    description:
      "Real-time tracking of shipping timelines to protect your seller standing. Get alerted before a deadline slips — not after a penalty arrives.",
    color: "emerald",
  },
];

const secondaryFeatures = [
  {
    icon: Zap,
    title: "Instant Refresh",
    description: "Orders sync in near real-time so you always act on current data.",
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description: "Configurable notifications for late shipments and at-risk orders.",
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description: "Track fulfillment rates, shipping speed, and shop-level KPIs.",
  },
];

const colorMap: Record<string, string> = {
  indigo:
    "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white",
  violet:
    "bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white",
  emerald:
    "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
};

export default function Features() {
  return (
    <section id="features" className="bg-slate-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600 mb-3">
            Platform capabilities
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Everything you need to run operations at scale
          </h2>
          <p className="mt-4 text-lg text-slate-500 leading-relaxed">
            Built for high-volume merchants who can&apos;t afford to miss a
            deadline or lose visibility across their portfolio.
          </p>
        </div>

        {/* Primary feature cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {primaryFeatures.map(({ icon: Icon, title, description, color }) => (
            <div
              key={title}
              className="group relative rounded-2xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div
                className={`inline-flex h-11 w-11 items-center justify-center rounded-xl transition-colors duration-200 ${colorMap[color]}`}
              >
                <Icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">
                {title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-500">
                {description}
              </p>
            </div>
          ))}
        </div>

        {/* Secondary feature strip */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {secondaryFeatures.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white px-6 py-5 hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors duration-200"
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <Icon className="h-4 w-4" strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{title}</p>
                <p className="mt-1 text-sm text-slate-500">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
