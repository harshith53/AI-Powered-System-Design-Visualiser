const QUOTES = [
  {
    quote:
      "Cut my system design interview prep time in half — I could see the tradeoffs instead of just reading about them.",
    name: "Early user",
    role: "Backend Engineer",
  },
  {
    quote:
      "The root-cause analysis alone is worth it. It catches failure modes I wouldn't have thought to ask about.",
    name: "Early user",
    role: "Staff Engineer",
  },
];

export function SocialProof() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 grid grid-cols-2 gap-4 rounded-2xl border border-white/15 bg-white/5 p-5 text-center sm:grid-cols-4">
          <div>
            <p className="text-xl font-semibold text-cyan-200">60 FPS</p>
            <p className="text-xs text-slate-400">Canvas interactions</p>
          </div>
          <div>
            <p className="text-xl font-semibold text-cyan-200">&lt;50ms</p>
            <p className="text-xs text-slate-400">Cache hit speed</p>
          </div>
          <div>
            <p className="text-xl font-semibold text-cyan-200">6 Tabs</p>
            <p className="text-xs text-slate-400">Deep analysis</p>
          </div>
          <div>
            <p className="text-xl font-semibold text-cyan-200">10 req/min</p>
            <p className="text-xs text-slate-400">Rate-limited safety</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {QUOTES.map((item, i) => (
            <blockquote
              key={i}
              className="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-md"
            >
              <p className="text-slate-200">&ldquo;{item.quote}&rdquo;</p>
              <footer className="mt-4 text-sm text-slate-400">
                {item.name} — {item.role}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
