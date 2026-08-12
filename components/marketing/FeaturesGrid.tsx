const FEATURES = [
  {
    tag: "Risk Radar",
    title: "Root Cause Analysis",
    description:
      "AI-identified potential failure points with probability ratings, so you know where the system is fragile before it breaks.",
    bullets: ["Failure probability scoring", "Blast-radius mapping", "Top-risk prioritization"],
  },
  {
    tag: "Fix Engine",
    title: "Solutions",
    description:
      "Intelligent remediation strategies with tradeoff analysis for every weak point the AI surfaces.",
    bullets: ["Mitigation playbooks", "Effort vs impact tradeoffs", "Recommended implementation path"],
  },
  {
    tag: "Blueprint",
    title: "Diagrams",
    description:
      "Interactive HLD and LLD Mermaid diagrams, generated straight from your problem description.",
    bullets: ["HLD for system framing", "LLD for internals", "Shareable visual output"],
  },
  {
    tag: "Trace",
    title: "Request Flow",
    description:
      "Protocol-level request flow breakdowns showing exactly how data moves through the system.",
    bullets: ["Step-by-step request path", "Service-to-service trace", "Bottleneck visibility"],
  },
  {
    tag: "Scale Lab",
    title: "Scaling",
    description:
      "Horizontal, vertical, database, cache, and CDN scaling recommendations tailored to your architecture.",
    bullets: ["QPS-aware recommendations", "Infra evolution strategy", "Capacity planning hints"],
  },
  {
    tag: "Coach",
    title: "Interview Prep",
    description:
      "Auto-generated system design interview questions based on the architecture you just built.",
    bullets: ["Follow-up challenge prompts", "Tradeoff discussion drills", "Senior-level question bank"],
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="relative px-6 py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-56 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.18),transparent_70%)]"
      />
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/85">
            Core Modules
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Useful outputs, not just pretty cards
          </h2>
          <p className="mt-4 text-slate-300">
            Every module gives action-ready signal you can use in design docs,
            production planning, and interview discussions.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <div
              key={feature.title}
              className="mkt-reveal group relative overflow-hidden rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-cyan-200/35 hover:bg-white/10"
              style={{ animationDelay: `${index * 110}ms` }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(circle at 10% 0%, rgba(56,189,248,0.25), transparent 45%)",
                }}
              />
              <div className="relative flex items-center justify-between">
                <span className="rounded-full border border-cyan-200/20 bg-cyan-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan-200">
                  {feature.tag}
                </span>
                <span className="text-xs text-slate-400">0{index + 1}</span>
              </div>
              <h3 className="mt-3 text-lg font-semibold text-white">{feature.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{feature.description}</p>
              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                {feature.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-center gap-2">
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
