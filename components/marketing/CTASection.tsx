import { SignUpButton } from "@clerk/nextjs";

export function CTASection() {
  return (
    <section id="get-started" className="px-6 py-24">
      <div className="mx-auto max-w-4xl rounded-3xl border border-cyan-200/20 bg-linear-to-br from-cyan-400/15 via-sky-300/10 to-emerald-300/15 p-10 text-center shadow-[0_30px_90px_rgba(2,132,199,0.2)] backdrop-blur-xl sm:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/90">
          Build Better Faster
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Ready to architect like a senior in under 60 seconds?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-slate-300">
          Open the designer, drop in your scenario, and walk away with a blueprint
          you can present, debate, and ship from.
        </p>
        <div className="mt-8">
          <SignUpButton mode="modal" forceRedirectUrl="/design">
            <button className="rounded-xl bg-linear-to-r from-cyan-300 to-emerald-300 px-8 py-3 text-sm font-semibold text-[#04131b] shadow-[0_14px_45px_rgba(16,185,129,0.4)] transition hover:brightness-110">
              Get Started Free
            </button>
          </SignUpButton>
        </div>
      </div>
    </section>
  );
}
