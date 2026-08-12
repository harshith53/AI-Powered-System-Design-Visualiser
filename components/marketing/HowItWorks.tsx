import { ExampleDesignFlow } from "./ExampleDesignFlow";

const STEPS = [
  {
    number: "01",
    title: "Describe your system",
    description:
      "Type a problem in plain English — \"design a URL shortener\", \"design Twitter's timeline\" — whatever you're working through.",
    io: "Input: plain prompt  |  Output: scoped architecture intent",
  },
  {
    number: "02",
    title: "AI generates the architecture",
    description:
      "The model produces a complete blueprint: components, data flow, HLD/LLD diagrams, and failure points.",
    io: "Input: system constraints  |  Output: nodes, edges, diagrams, risks",
  },
  {
    number: "03",
    title: "Explore, analyze, share",
    description:
      "Walk the interactive canvas, step through the request timeline, and share a link with your team.",
    io: "Input: generated blueprint  |  Output: decision-ready design narrative",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200/85">
            Workflow
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            How it works
          </h2>
          <p className="mt-4 text-slate-300">
            A clear flow from idea to review-ready system blueprint.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <div
              key={step.number}
              className="mkt-reveal relative rounded-2xl border border-white/15 bg-linear-to-b from-white/10 to-white/5 p-6 backdrop-blur-md"
              style={{ animationDelay: `${index * 140}ms` }}
            >
              {index < STEPS.length - 1 ? (
                <>
                  <span
                    aria-hidden
                    className="mkt-flow-link-y absolute -bottom-8 left-1/2 h-8 w-px -translate-x-1/2 md:hidden"
                  />
                  <span
                    aria-hidden
                    className="mkt-flow-link-x absolute -right-6 top-10 hidden h-px w-12 md:block"
                  />
                </>
              ) : null}
              <span className="inline-flex rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2 py-1 text-sm font-mono text-emerald-300">
                {step.number}
              </span>
              <h3 className="mt-3 text-lg font-semibold text-white">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{step.description}</p>
              <p className="mt-4 rounded-lg border border-cyan-200/15 bg-cyan-400/5 px-3 py-2 text-xs text-cyan-100/90">
                {step.io}
              </p>
            </div>
          ))}
        </div>

        <div className="mkt-reveal mt-12 rounded-2xl border border-cyan-200/20 bg-linear-to-b from-cyan-400/8 to-emerald-400/6 p-6 shadow-[0_20px_70px_rgba(2,6,23,0.45)]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-cyan-200/30 bg-cyan-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-200">
              Real Example
            </span>
            <span className="text-xs text-slate-400">Complex System Design Scenarios</span>
          </div>

          <p className="mt-4 text-sm text-slate-200">
            Pick one of the curated hard questions below. Each question updates its
            own answer snapshot and architecture graph preview.
          </p>

          <div className="mt-5">
            <ExampleDesignFlow />
          </div>
        </div>
      </div>
    </section>
  );
}
