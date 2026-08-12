import Image from "next/image";

const SHOTS = [
  {
    title: "Design 1",
    subtitle: "Interactive canvas + architecture graph",
    src: "/image/Design_1.png",
  },
  {
    title: "Design 2",
    subtitle: "Analysis panels with guided insights",
    src: "/image/Design_2.png",
  },
  {
    title: "Design 3",
    subtitle: "Flow breakdowns and system storytelling",
    src: "/image/Design_3.png",
  },
];

export function ProductShowcase() {
  return (
    <section id="product-showcase" className="relative px-6 py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-8 -z-10 h-56 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.18),transparent_70%)]"
      />

      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/90">
            Product Vibe
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Real interfaces. Real architecture energy.
          </h2>
          <p className="mt-4 text-slate-300">
            A visual system-design cockpit built for fast ideation, deep analysis,
            and interview-ready communication.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {SHOTS.map((shot, idx) => (
            <article
              key={shot.title}
              className="group relative overflow-hidden rounded-2xl border border-white/15 bg-white/4 p-3 shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-md transition duration-300 hover:-translate-y-1.5 hover:border-cyan-200/35"
            >
              <div className="relative aspect-16/10 overflow-hidden rounded-xl border border-white/10">
                <Image
                  src={shot.src}
                  alt={`${shot.title} screenshot`}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  priority={idx === 0}
                />
              </div>
              <div className="mt-4 px-1 pb-2">
                <p className="text-sm font-semibold text-white">{shot.title}</p>
                <p className="mt-1 text-xs text-slate-300">{shot.subtitle}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}