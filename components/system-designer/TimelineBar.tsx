"use client";

import { motion } from "framer-motion";
import type { AnimationStep } from "@/types/architecture";

type Props = {
  steps: AnimationStep[];
  currentIndex: number;
  isPlaying: boolean;
  onSelect: (index: number) => void;
};

export function TimelineBar({
  steps,
  currentIndex,
  isPlaying,
  onSelect,
}: Props) {
  return (
    <footer className="shrink-0 border-t border-white/10 bg-[#0a0f17]/95 backdrop-blur">
      <div className="flex items-center gap-3 px-4 py-2.5">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
          <span
            className={[
              "h-1.5 w-1.5 rounded-full",
              isPlaying ? "bg-emerald-400 animate-pulse" : "bg-white/30",
            ].join(" ")}
          />
          Execution timeline
        </div>
        <div className="ml-1 text-[11px] text-white/30">
          {currentIndex + 1} / {steps.length}
        </div>
        <div className="relative ml-2 flex min-w-0 flex-1 items-stretch gap-1.5 overflow-x-auto pb-1">
          {steps.map((s, i) => {
            const active = i === currentIndex;
            const past = i < currentIndex;
            return (
              <button
                key={s.id}
                onClick={() => onSelect(i)}
                className={[
                  "group relative flex min-w-[148px] flex-1 flex-col items-start gap-1 rounded-md border px-3 py-2 text-left transition-colors",
                  active
                    ? "border-sky-400/60 bg-sky-400/10"
                    : past
                      ? "border-white/10 bg-white/[0.02] hover:border-white/20"
                      : "border-white/10 bg-transparent hover:border-white/20 hover:bg-white/[0.02]",
                ].join(" ")}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={[
                      "grid h-4 w-4 place-items-center rounded-full text-[9px] font-semibold",
                      active
                        ? "bg-sky-400 text-[#0a0f17]"
                        : past
                          ? "bg-emerald-400/80 text-[#0a0f17]"
                          : "border border-white/15 text-white/40",
                    ].join(" ")}
                  >
                    {past ? "✓" : i + 1}
                  </span>
                  <span
                    className={[
                      "truncate text-[11.5px] font-medium",
                      active ? "text-white" : "text-white/65",
                    ].join(" ")}
                  >
                    {s.title}
                  </span>
                </div>
                {active ? (
                  <motion.div
                    layoutId="step-underline"
                    className="absolute inset-x-0 -bottom-[1px] h-[2px] rounded-full bg-sky-400/80"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
