"use client";

import { AnimatePresence, motion } from "framer-motion";
import type {
  AnimationStep,
  ArchitectureNode,
} from "@/types/architecture";

type Props = {
  open: boolean;
  onClose: () => void;
  node: ArchitectureNode | null;
  currentStep: AnimationStep | null;
};

export function DetailsDrawer({ open, onClose, node, currentStep }: Props) {
  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.aside
          key="drawer"
          initial={{ x: 24, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 24, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          className="flex h-full w-[360px] shrink-0 flex-col border-l border-white/10 bg-[#0a0f17]"
        >
          <DrawerHeader title={node?.label ?? "Details"} onClose={onClose} />
          <div className="min-h-0 flex-1 overflow-y-auto">
            {node ? (
              <NodeDetails node={node} />
            ) : (
              <EmptyState />
            )}
            {currentStep ? <StepCard step={currentStep} /> : null}
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}

function DrawerHeader({
  title,
  onClose,
}: {
  title: string;
  onClose: () => void;
}) {
  return (
    <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 px-4">
      <div className="text-[12px] uppercase tracking-[0.18em] text-white/40">
        {title}
      </div>
      <button
        onClick={onClose}
        className="grid h-7 w-7 place-items-center rounded-md border border-white/10 bg-white/[0.03] text-white/50 transition-colors hover:border-white/20 hover:text-white"
        aria-label="Close drawer"
      >
        ✕
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="px-4 py-6 text-[12px] leading-relaxed text-white/40">
      Select a node on the canvas to inspect its responsibilities, failure
      risks, and operational notes.
    </div>
  );
}

function NodeDetails({ node }: { node: ArchitectureNode }) {
  return (
    <div className="space-y-5 px-4 py-4">
      <div>
        <div className="mb-1 text-[11px] uppercase tracking-[0.16em] text-white/40">
          {node.type}
        </div>
        <h2 className="text-[15px] font-semibold tracking-tight text-white">
          {node.label}
        </h2>
        {node.sublabel ? (
          <div className="mt-0.5 text-[11px] uppercase tracking-wider text-white/40">
            {node.sublabel}
          </div>
        ) : null}
      </div>

      <Section title="Description">
        <p className="text-[12.5px] leading-relaxed text-white/70">
          {node.description}
        </p>
      </Section>

      <Section title="Failure risks">
        <BulletList items={node.risks} tone="rose" />
      </Section>

      <Section title="Operational notes">
        <BulletList items={node.notes} tone="emerald" />
      </Section>

      <Section title="Implementation notes">
        <p className="text-[12px] leading-relaxed text-white/55">
          Replace this block with code-level details, pseudo-code, or links to
          runbooks once the LLD view is wired up.
        </p>
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
        {title}
      </div>
      {children}
    </section>
  );
}

function BulletList({
  items,
  tone,
}: {
  items: string[];
  tone: "rose" | "emerald";
}) {
  const dot = tone === "rose" ? "bg-rose-400/80" : "bg-emerald-400/80";
  if (!items.length) {
    return (
      <div className="text-[12px] italic text-white/30">None recorded.</div>
    );
  }
  return (
    <ul className="space-y-1.5">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2 text-[12.5px] text-white/70">
          <span className={["mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", dot].join(" ")} />
          <span className="leading-relaxed">{it}</span>
        </li>
      ))}
    </ul>
  );
}

function StepCard({ step }: { step: AnimationStep }) {
  return (
    <div className="m-4 mt-0 rounded-md border border-white/10 bg-white/[0.02] p-3">
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-300/80">
        Current step · {step.title}
      </div>
      <p className="text-[12px] leading-relaxed text-white/65">
        {step.description}
      </p>
    </div>
  );
}
