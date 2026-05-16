import WaitlistForm from "./WaitlistForm";

export default function WaitlistSection() {
  return (
    <section
      id="waitlist"
      className="relative overflow-hidden bg-indigo-700 py-20 sm:py-28"
    >
      {/* Background decoration */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 right-0 h-[400px] w-[400px] rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute bottom-0 -left-20 h-[300px] w-[300px] rounded-full bg-violet-600/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Be first in line when we launch
          </h2>
          <p className="mt-4 text-lg text-indigo-200 leading-relaxed">
            Join hundreds of multi-shop sellers who&apos;ve already claimed
            their founding member spot. Early access includes locked-in pricing
            and priority onboarding.
          </p>
          <div className="mt-8 mx-auto max-w-lg">
            <WaitlistForm variant="hero" />
          </div>
        </div>
      </div>
    </section>
  );
}
