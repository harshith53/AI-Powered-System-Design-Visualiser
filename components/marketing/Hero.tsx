import { SignUpButton } from "@clerk/nextjs";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-16 sm:pt-20 md:pb-28 md:pt-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.22),transparent_42%),radial-gradient(circle_at_75%_0%,rgba(16,185,129,0.2),transparent_45%)]"
      />
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_0.86fr]">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-md">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
            AI Architect Copilot for Interview-Grade Designs
          </div>

          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
            Turn rough ideas into
            <span className="block bg-linear-to-r from-cyan-300 via-sky-300 to-emerald-300 bg-clip-text text-transparent">
              production-ready architecture
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-slate-300">
            Prompt once. Get an explorable system graph, failure analysis,
            scale strategy, and protocol-level request flows in one cinematic
            workspace.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:items-stretch">
            <SignUpButton mode="modal" forceRedirectUrl="/design">
              <button className="w-full rounded-xl bg-linear-to-r from-cyan-300 to-emerald-300 px-8 py-3 text-sm font-semibold text-[#031018] shadow-[0_14px_45px_rgba(16,185,129,0.4)] transition hover:brightness-110 sm:w-auto">
                Start Designing Free
              </button>
            </SignUpButton>
            <a
              href="#how-it-works"
              className="w-full rounded-xl border border-white/20 bg-white/10 px-8 py-3 text-center text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/15 sm:w-auto"
            >
              Watch The Flow
            </a>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 text-sm text-slate-300 sm:max-w-xl sm:grid-cols-4">
            <div className="rounded-xl border border-white/15 bg-white/5 px-3 py-3 text-center">
              <p className="text-lg font-semibold text-cyan-200">HLD</p>
              <p className="mt-1 text-xs">Macro view</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/5 px-3 py-3 text-center">
              <p className="text-lg font-semibold text-cyan-200">LLD</p>
              <p className="mt-1 text-xs">Deep internals</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/5 px-3 py-3 text-center">
              <p className="text-lg font-semibold text-cyan-200">Flow</p>
              <p className="mt-1 text-xs">Step timeline</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/5 px-3 py-3 text-center">
              <p className="text-lg font-semibold text-cyan-200">RCA</p>
              <p className="mt-1 text-xs">Failure map</p>
            </div>
          </div>
        </div>

        <div className="mkt-float relative">
          <div className="mkt-scan mkt-arch-shell relative overflow-hidden rounded-3xl border border-cyan-200/20 bg-linear-to-b from-[#0f1728]/95 via-[#091225]/92 to-[#06101c]/95 p-5 shadow-[0_30px_90px_rgba(2,6,23,0.75)] backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/90">
                Architecture Output
              </p>
              <span className="rounded-full border border-emerald-300/25 bg-emerald-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-emerald-200">
                Generated
              </span>
            </div>

            <div className="grid gap-1">
              <div className="mkt-arch-node rounded-xl border border-sky-200/20 bg-sky-400/5 p-3" style={{ animationDelay: "0ms" }}>
                <p className="text-xs text-sky-100">Ingress</p>
                <p className="mt-1 text-sm font-medium text-white">API Gateway + Auth</p>
              </div>

              <div className="relative ml-2 h-4">
                <span aria-hidden className="mkt-arch-link-v absolute left-6 top-0 h-4 w-px" />
              </div>

              <div className="mkt-arch-node ml-8 rounded-xl border border-emerald-200/20 bg-emerald-400/5 p-3" style={{ animationDelay: "420ms" }}>
                <p className="text-xs text-emerald-100">Core Service</p>
                <p className="mt-1 text-sm font-medium text-white">Traffic Router + Policy Engine</p>
              </div>

              <div className="relative ml-8 h-6">
                <span aria-hidden className="mkt-arch-link-v absolute left-12 top-0 h-3 w-px" />
                <span aria-hidden className="mkt-arch-link-h absolute left-12 top-3 h-px w-24" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="mkt-arch-node rounded-xl border border-cyan-200/20 bg-cyan-400/5 p-3" style={{ animationDelay: "760ms" }}>
                  <p className="text-xs text-cyan-100">Cache</p>
                  <p className="mt-1 text-sm font-medium text-white">Redis Cluster</p>
                </div>
                <div className="mkt-arch-node rounded-xl border border-indigo-200/20 bg-indigo-400/5 p-3" style={{ animationDelay: "980ms" }}>
                  <p className="text-xs text-indigo-100">Storage</p>
                  <p className="mt-1 text-sm font-medium text-white">Multi-AZ SQL</p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs text-slate-300">
              <div className="rounded-lg border border-white/10 bg-white/5 px-2 py-2">99.95% SLA</div>
              <div className="rounded-lg border border-white/10 bg-white/5 px-2 py-2">p95 140ms</div>
              <div className="rounded-lg border border-white/10 bg-white/5 px-2 py-2">10k QPS</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
