"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ArchitectureBlueprint, RootCause, Solution, RequestFlowStep, ScalingNote } from "@/types/architecture";
import { MermaidDiagram } from "./MermaidDiagram";

type Tab = "rootcauses" | "solutions" | "requestflow" | "scaling" | "diagrams" | "questions";

const TABS: { id: Tab; label: string }[] = [
  { id: "rootcauses",  label: "Root Causes" },
  { id: "solutions",   label: "Solutions" },
  { id: "diagrams",    label: "Diagrams" },
  { id: "requestflow", label: "Request Flow" },
  { id: "scaling",     label: "Scaling" },
  { id: "questions",   label: "Interview" },
];

type Props = {
  open: boolean;
  onClose: () => void;
  blueprint: ArchitectureBlueprint;
};

export function AnalysisPanel({ open, onClose, blueprint }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("rootcauses");

  const hasData =
    (blueprint.rootCauses?.length ?? 0) > 0 ||
    (blueprint.solutions?.length ?? 0) > 0 ||
    blueprint.hldMermaid ||
    blueprint.lldMermaid;

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.aside
          key="analysis"
          initial={{ x: 24, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 24, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          className="flex h-full w-155 shrink-0 flex-col border-l border-white/10 bg-[#0a0f17]"
        >
          {/* Header */}
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 px-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
              Analysis
            </div>
            <button
              onClick={onClose}
              className="grid h-7 w-7 place-items-center rounded-md border border-white/10 bg-white/3 text-white/50 transition-colors hover:border-white/20 hover:text-white"
              aria-label="Close analysis panel"
            >
              ✕
            </button>
          </div>

          {/* Tab bar */}
          <div className="flex shrink-0 gap-0.5 overflow-x-auto border-b border-white/10 px-2 py-1.5 scrollbar-none">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={[
                  "shrink-0 rounded px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors",
                  activeTab === t.id
                    ? "bg-white/10 text-white"
                    : "text-white/40 hover:text-white/70",
                ].join(" ")}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            {!hasData ? (
              <EmptyState />
            ) : (
              <>
                {activeTab === "rootcauses" && (
                  <RootCausesTab causes={blueprint.rootCauses} />
                )}
                {activeTab === "solutions" && (
                  <SolutionsTab solutions={blueprint.solutions} />
                )}
                {activeTab === "diagrams" && (
                  <DiagramsTab hld={blueprint.hldMermaid} lld={blueprint.lldMermaid} />
                )}
                {activeTab === "requestflow" && (
                  <RequestFlowTab steps={blueprint.requestFlow} />
                )}
                {activeTab === "scaling" && (
                  <ScalingTab notes={blueprint.scalingNotes} />
                )}
                {activeTab === "questions" && (
                  <InterviewTab questions={blueprint.interviewQuestions} />
                )}
              </>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="px-4 py-6 text-[12px] leading-relaxed text-white/35">
      Submit a prompt to generate an analysis. Root causes, solutions, diagrams, and
      interview questions will appear here.
    </div>
  );
}

// ─── Root Causes ──────────────────────────────────────────────────────────────
const PROB_STYLE: Record<RootCause["probability"], string> = {
  high:   "bg-rose-400/15 text-rose-300 border-rose-400/30",
  medium: "bg-amber-400/15 text-amber-300 border-amber-400/30",
  low:    "bg-sky-400/15 text-sky-300 border-sky-400/30",
};

function RootCausesTab({ causes }: { causes?: RootCause[] }) {
  if (!causes?.length) return <NoData label="root causes" />;
  return (
    <div className="space-y-3 px-4 py-4">
      {causes.map((c, i) => (
        <div key={i} className="rounded-md border border-white/[0.07] bg-white/[0.02] p-3">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[12.5px] font-medium leading-snug text-white/85">{c.cause}</p>
            <span className={["shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider", PROB_STYLE[c.probability]].join(" ")}>
              {c.probability}
            </span>
          </div>
          {c.detectionMetric && (
            <p className="mt-1.5 text-[11px] leading-relaxed text-white/40">
              <span className="text-white/25">Metric: </span>{c.detectionMetric}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Solutions ────────────────────────────────────────────────────────────────
const EFFORT_STYLE: Record<Solution["effort"], string> = {
  low:    "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
  medium: "bg-amber-400/15 text-amber-300 border-amber-400/30",
  high:   "bg-rose-400/15 text-rose-300 border-rose-400/30",
};

function SolutionsTab({ solutions }: { solutions?: Solution[] }) {
  if (!solutions?.length) return <NoData label="solutions" />;
  return (
    <div className="space-y-3 px-4 py-4">
      {solutions.map((s, i) => (
        <div key={i} className="rounded-md border border-white/[0.07] bg-white/2 p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[12.5px] font-semibold text-white">{s.title}</p>
            <span className={["shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider", EFFORT_STYLE[s.effort]].join(" ")}>
              {s.effort} effort
            </span>
          </div>
          <p className="text-[12px] leading-relaxed text-white/65">{s.description}</p>
          {s.tradeoffs && (
            <div className="rounded border border-amber-400/15 bg-amber-400/4 px-2.5 py-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-400/60">Trade-off </span>
              <span className="text-[11.5px] text-amber-200/60">{s.tradeoffs}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Diagrams ─────────────────────────────────────────────────────────────────
function DiagramsTab({ hld, lld }: { hld?: string; lld?: string }) {
  const [view, setView] = useState<"hld" | "lld">("hld");
  if (!hld && !lld) return <NoData label="diagrams" />;

  return (
    <div className="px-4 py-4 space-y-3">
      {hld && lld && (
        <div className="flex gap-1 rounded-md border border-white/10 bg-white/3 p-0.5 w-fit">
          {(["hld", "lld"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={[
                "rounded px-3 py-1 text-[10px] font-bold uppercase tracking-widest transition-colors",
                view === v ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70",
              ].join(" ")}
            >
              {v}
            </button>
          ))}
        </div>
      )}
      {view === "hld" && hld && <MermaidDiagram definition={hld} label="High Level Design" />}
      {view === "lld" && lld && <MermaidDiagram definition={lld} label="Low Level Design" />}
      {view === "hld" && !hld && lld && <MermaidDiagram definition={lld} label="Low Level Design" />}
    </div>
  );
}

// ─── Request Flow ─────────────────────────────────────────────────────────────
function RequestFlowTab({ steps }: { steps?: RequestFlowStep[] }) {
  if (!steps?.length) return <NoData label="request flow" />;
  return (
    <div className="px-4 py-4">
      <div className="relative ml-2 space-y-0">
        {steps.map((s, i) => (
          <div key={i} className="relative flex gap-3 pb-4">
            {/* Vertical line */}
            {i < steps.length - 1 && (
              <div className="absolute left-[7px] top-5 h-full w-px bg-white/10" />
            )}
            {/* Dot */}
            <div className="relative mt-1 h-3.5 w-3.5 shrink-0 rounded-full border border-sky-400/50 bg-sky-400/20" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 text-[12px] font-medium text-white/80">
                <span>{s.from}</span>
                <span className="text-white/25">→</span>
                <span>{s.to}</span>
                <span className="rounded border border-white/10 bg-white/4 px-1.5 py-0.5 font-mono text-[9px] text-white/40">
                  {s.protocol}
                </span>
              </div>
              {s.note && (
                <p className="mt-0.5 text-[11px] leading-relaxed text-white/40">{s.note}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Scaling ──────────────────────────────────────────────────────────────────
const DIM_COLORS: Record<ScalingNote["dimension"], string> = {
  horizontal: "bg-sky-400/15 text-sky-300 border-sky-400/30",
  vertical:   "bg-violet-400/15 text-violet-300 border-violet-400/30",
  database:   "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
  cache:      "bg-fuchsia-400/15 text-fuchsia-300 border-fuchsia-400/30",
  cdn:        "bg-amber-400/15 text-amber-300 border-amber-400/30",
};

function ScalingTab({ notes }: { notes?: ScalingNote[] }) {
  if (!notes?.length) return <NoData label="scaling notes" />;
  return (
    <div className="space-y-3 px-4 py-4">
      {notes.map((n, i) => (
        <div key={i} className="flex gap-3">
          <span className={["mt-0.5 shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider h-fit", DIM_COLORS[n.dimension]].join(" ")}>
            {n.dimension}
          </span>
          <p className="text-[12px] leading-relaxed text-white/70">{n.suggestion}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Interview questions ──────────────────────────────────────────────────────
function InterviewTab({ questions }: { questions?: string[] }) {
  if (!questions?.length) return <NoData label="interview questions" />;
  return (
    <div className="space-y-2 px-4 py-4">
      {questions.map((q, i) => (
        <div
          key={i}
          className="flex gap-3 rounded-md border border-white/[0.07] bg-white/2 px-3 py-2.5"
        >
          <span className="mt-px shrink-0 text-[11px] font-bold text-white/20">{String(i + 1).padStart(2, "0")}</span>
          <p className="text-[12px] leading-relaxed text-white/75">{q}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Shared empty state ───────────────────────────────────────────────────────
function NoData({ label }: { label: string }) {
  return (
    <div className="px-4 py-6 text-[12px] italic text-white/25">
      No {label} available for this blueprint.
    </div>
  );
}
