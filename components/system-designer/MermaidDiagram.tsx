"use client";

import { useEffect, useRef, useState, Component, type ReactNode } from "react";

// ─── Error boundary ───────────────────────────────────────────────────────────
class MermaidErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

// ─── Incrementing ID to avoid mermaid conflicts between instances ─────────────
let idCounter = 0;

// ─── Inner renderer ───────────────────────────────────────────────────────────
function MermaidInner({ definition, label }: { definition: string; label?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const idRef = useRef(`mermaid-${++idCounter}`);

  useEffect(() => {
    if (!definition?.trim() || !ref.current) return;

    let cancelled = false;
    setError(null);
    setReady(false);

    // Dynamic import — never runs on server, avoids SSR issues
    import("mermaid").then(async (mod) => {
      if (cancelled) return;
      const mermaid = mod.default;

      mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        themeVariables: {
          background: "#070b11",
          primaryColor: "#0ea5e9",
          primaryTextColor: "#e2e8f0",
          primaryBorderColor: "#1e293b",
          lineColor: "#334155",
          secondaryColor: "#0f172a",
          tertiaryColor: "#0f172a",
          edgeLabelBackground: "#0a0f17",
          fontSize: "13px",
        },
        flowchart: { curve: "basis", padding: 20 },
        sequence: { actorMargin: 60, messageMargin: 30 },
      });

      try {
        const { svg } = await mermaid.render(idRef.current, definition.trim());
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
          // Make SVG responsive
          const svgEl = ref.current.querySelector("svg");
          if (svgEl) {
            svgEl.removeAttribute("width");
            svgEl.removeAttribute("height");
            svgEl.style.width = "100%";
            svgEl.style.height = "auto";
          }
          setReady(true);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Diagram parse error");
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [definition]);

  if (error) {
    return (
      <div className="rounded-md border border-rose-400/20 bg-rose-400/4 p-3">
        {label && (
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-rose-400/60">
            {label} — parse error
          </div>
        )}
        <pre className="overflow-x-auto whitespace-pre-wrap text-[10px] text-rose-300/70">
          {error}
        </pre>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {!ready && (
        <div className="flex h-24 items-center justify-center">
          <span className="text-[11px] text-white/30">Rendering diagram…</span>
        </div>
      )}
      {label && ready && (
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">
          {label}
        </div>
      )}
      <div
        ref={ref}
        className="w-full overflow-x-auto rounded-md [&_svg]:max-w-full!"
        style={{ display: ready ? "block" : "none" }}
      />
    </div>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────
export function MermaidDiagram({
  definition,
  label,
}: {
  definition: string;
  label?: string;
}) {
  if (!definition?.trim()) {
    return (
      <div className="flex h-16 items-center justify-center text-[11px] text-white/25">
        No diagram available
      </div>
    );
  }

  return (
    <MermaidErrorBoundary
      fallback={
        <div className="rounded-md border border-rose-400/20 bg-rose-400/4 p-3 text-[11px] text-rose-300/70">
          Failed to render diagram
        </div>
      }
    >
      <MermaidInner definition={definition} label={label} />
    </MermaidErrorBoundary>
  );
}
