import { Check, Sparkles } from "lucide-react";

const tiers = [
  {
    name: "Starter",
    tagline: "Perfect for solo operators",
    price: null,
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
    price: null,
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
    price: null,
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
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600 mb-3">
            Pricing
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Simple, transparent plans
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            Pricing launches alongside the product. Join the waitlist to lock in
            founding member rates.
          </p>
        </div>

        {/* Tier grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {tiers.map(({ name, tagline, featured, badge, features }) => (
            <div
              key={name}
              className={`relative flex flex-col rounded-2xl border p-8 ${
                featured
                  ? "border-indigo-500 bg-indigo-600 shadow-xl shadow-indigo-500/20 scale-[1.02]"
                  : "border-slate-200 bg-white shadow-sm"
              }`}
            >
              {badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-indigo-200 px-3 py-1 text-xs font-semibold text-indigo-600 shadow-sm">
                    <Sparkles className="h-3 w-3" />
                    {badge}
                  </span>
                </div>
              )}

              <div>
                <h3
                  className={`text-lg font-bold ${
                    featured ? "text-white" : "text-slate-900"
                  }`}
                >
                  {name}
                </h3>
                <p
                  className={`mt-1 text-sm ${
                    featured ? "text-indigo-200" : "text-slate-500"
                  }`}
                >
                  {tagline}
                </p>

                <div className="mt-6 mb-8">
                  <span
                    className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium ${
                      featured
                        ? "bg-white/15 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Pricing coming soon
                  </span>
                </div>
              </div>

              <ul className="flex-1 space-y-3 mb-8">
                {features.map((feat) => (
                  <li key={feat} className="flex items-start gap-3">
                    <Check
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        featured ? "text-indigo-200" : "text-emerald-600"
                      }`}
                      strokeWidth={2.5}
                    />
                    <span
                      className={`text-sm ${
                        featured ? "text-indigo-100" : "text-slate-600"
                      }`}
                    >
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href="#waitlist"
                className={`mt-auto block w-full rounded-xl py-3 text-center text-sm font-semibold transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2
                  ${
                    featured
                      ? "bg-white text-indigo-700 hover:bg-slate-50 focus-visible:ring-white"
                      : "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500"
                  }`}
              >
                {name === "Enterprise" ? "Contact Sales" : "Join the Waitlist"}
              </a>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-slate-400">
          All plans include a 14-day free trial. No credit card required at
          signup.
        </p>
      </div>
    </section>
  );
}
