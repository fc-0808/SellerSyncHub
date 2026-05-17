import WaitlistForm from "./WaitlistForm";

const socialProof = [
  { value: "500+",  label: "Sellers on waitlist"    },
  { value: "20+",   label: "Shops per merchant avg." },
  { value: "Free",  label: "During early access"    },
];

export default function WaitlistSection() {
  return (
    <section
      id="waitlist"
      className="relative overflow-hidden bg-slate-950 border-t border-white/8 py-20 sm:py-28"
    >
      {/* Background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="bg-dot-grid absolute inset-0" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[400px] w-[700px] rounded-full bg-indigo-600/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[300px] w-[400px] rounded-full bg-violet-700/8 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/25 bg-indigo-500/8 px-4 py-1.5 text-xs font-medium tracking-wide text-indigo-300 mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            Limited founding member spots available
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Be first in line when we launch
          </h2>
          <p className="mt-4 text-lg text-slate-400 leading-relaxed">
            Join hundreds of multi-shop sellers who&apos;ve already claimed their
            founding member spot. Early access includes locked-in pricing and
            priority onboarding.
          </p>

          {/* Social proof stats */}
          <div className="mt-10 mb-10 grid grid-cols-3 gap-4 border border-white/8 rounded-2xl px-6 py-5 bg-white/[0.025]">
            {socialProof.map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <span className="text-xl font-bold text-white tabular-nums">{value}</span>
                <span className="text-xs text-slate-500 text-center leading-snug">{label}</span>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="mx-auto max-w-lg">
            <WaitlistForm variant="hero" />
          </div>

        </div>
      </div>
    </section>
  );
}
