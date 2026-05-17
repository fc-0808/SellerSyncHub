import { Check, Lock } from "lucide-react";

const tiers = [
  {
    name: "Starter",
    tagline: "Perfect for solo operators",
    featured: false,
    features: [
      "Up to 3 storefronts",
      "1,000 orders / month",
      "Deadline Guard alerts",
      "Email notifications",
      "7-day data history",
    ],
  },
  {
    name: "Professional",
    tagline: "For growing multi-shop sellers",
    featured: true,
    badge: "Most Popular",
    features: [
      "Up to 10 storefronts",
      "Unlimited orders",
      "Priority sync (< 30s)",
      "Advanced analytics",
      "90-day data history",
      "Slack & email alerts",
    ],
  },
  {
    name: "Enterprise",
    tagline: "Built for large-scale operations",
    featured: false,
    features: [
      "Unlimited storefronts",
      "Unlimited orders",
      "Dedicated sync infrastructure",
      "Custom integrations",
      "Unlimited data history",
      "Dedicated account manager",
      "SLA guarantee",
    ],
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 mb-3">
            Pricing
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Simple, transparent plans
          </h2>
          <p className="mt-4 text-lg text-slate-500 leading-relaxed">
            Pricing reveals at launch. Join the waitlist to lock in founding member rates.
          </p>
        </div>

        {/* Tier grid */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:items-start">
          {tiers.map(({ name, tagline, featured, badge, features }) => (
            <div
              key={name}
              className={`relative flex flex-col rounded-2xl p-8 transition-all duration-200 ${
                featured
                  ? "bg-slate-950 shadow-2xl shadow-slate-950/25 ring-1 ring-slate-950"
                  : "border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-slate-300"
              }`}
            >
              {badge && (
                <div className="absolute -top-3.5 inset-x-0 flex justify-center">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-white px-3 py-1 text-xs font-semibold text-indigo-600 shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    {badge}
                  </span>
                </div>
              )}

              {/* Plan name + tagline */}
              <h3 className={`text-[17px] font-bold ${featured ? "text-white" : "text-slate-900"}`}>
                {name}
              </h3>
              <p className={`mt-1 text-sm ${featured ? "text-slate-400" : "text-slate-500"}`}>
                {tagline}
              </p>

              {/* Price reveal block */}
              <div className={`mt-7 mb-8 flex items-center gap-3 rounded-xl p-4 ${
                featured ? "bg-white/5 border border-white/8" : "bg-slate-50 border border-slate-100"
              }`}>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                  featured ? "bg-indigo-500/20" : "bg-slate-200"
                }`}>
                  <Lock className={`h-3.5 w-3.5 ${featured ? "text-indigo-400" : "text-slate-400"}`} strokeWidth={2.5} />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${featured ? "text-white" : "text-slate-700"}`}>
                    Founding member pricing
                  </p>
                  <p className={`text-xs mt-0.5 ${featured ? "text-slate-500" : "text-slate-400"}`}>
                    Revealed to waitlist at launch
                  </p>
                </div>
              </div>

              {/* Feature list */}
              <ul className="flex-1 space-y-3.5 mb-8">
                {features.map((feat) => (
                  <li key={feat} className="flex items-start gap-3">
                    <Check
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        featured ? "text-indigo-400" : "text-emerald-600"
                      }`}
                      strokeWidth={2.5}
                    />
                    <span className={`text-sm ${featured ? "text-slate-300" : "text-slate-600"}`}>
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href="#waitlist"
                className={`mt-auto block w-full rounded-xl py-3 text-center text-sm font-semibold transition-all duration-150 active:scale-[0.98]
                  focus-visible:outline-none focus-visible:ring-2
                  ${featured
                    ? "bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:ring-indigo-400"
                    : "bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-slate-600"
                  }`}
              >
                {name === "Enterprise" ? "Contact Sales" : "Join the Waitlist"}
              </a>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-slate-400">
          All plans include a 14-day free trial. No credit card required at signup.
        </p>
      </div>
    </section>
  );
}
