"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { HistoryEntry } from "@/hooks/useLocalHistory";

type Props = {
  open: boolean;
  onClose: () => void;
  history: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
  activeId?: string;
};

// ─── Group by time period ─────────────────────────────────────────────────────
type Group = { label: string; entries: HistoryEntry[] };

function groupByTime(entries: HistoryEntry[]): Group[] {
  const now = Date.now();
  const DAY = 86_400_000;

  const groups: Group[] = [
    { label: "Today",        entries: [] },
    { label: "Yesterday",    entries: [] },
    { label: "Last 7 days",  entries: [] },
    { label: "Older",        entries: [] },
  ];

  for (const e of entries) {
    const age = now - e.savedAt;
    if (age < DAY)         groups[0].entries.push(e);
    else if (age < 2 * DAY) groups[1].entries.push(e);
    else if (age < 7 * DAY) groups[2].entries.push(e);
    else                    groups[3].entries.push(e);
  }

  return groups.filter((g) => g.entries.length > 0);
}

function relativeTime(ms: number): string {
  const diff = Date.now() - ms;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function HistorySidebar({
  open,
  onClose,
  history,
  onSelect,
  onRemove,
  onClearAll,
  activeId,
}: Props) {
  const groups = groupByTime(history);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="hist-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sidebar — RIGHT side */}
          <motion.aside
            key="hist-sidebar"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 34 }}
            className="fixed right-0 top-0 z-30 flex h-full w-[320px] flex-col border-l border-white/10 bg-[#0a0f17] shadow-2xl"
          >
            {/* Header */}
            <div className="flex h-12 shrink-0 items-center justify-between px-4 border-b border-white/6">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">History</div>
                <div className="text-[9px] text-white/25">{history.length} item{history.length !== 1 ? "s" : ""}</div>
              </div>
              <button
                onClick={onClose}
                className="grid h-7 w-7 place-items-center rounded-md border border-white/10 bg-white/3 text-white/50 transition-colors hover:border-white/20 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* List */}
            <div className="min-h-0 flex-1 overflow-y-auto py-2">
              {groups.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <div className="text-3xl mb-3 opacity-20">⏱</div>
                  <p className="text-[12px] text-white/30">No history yet.</p>
                  <p className="text-[11px] text-white/20 mt-1">Generate a blueprint to see it here.</p>
                </div>
              ) : (
                groups.map((group) => (
                  <div key={group.label} className="mb-1">
                    {/* Group label */}
                    <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/25">
                      {group.label}
                    </div>

                    {/* Entries */}
                    {group.entries.map((entry) => {
                      const isActive = entry.id === activeId;
                      return (
                        <div
                          key={entry.id}
                          className={[
                            "group relative mx-2 mb-0.5 rounded-lg transition-colors",
                            isActive
                              ? "bg-white/8"
                              : "hover:bg-white/5",
                          ].join(" ")}
                        >
                          <button
                            className="w-full px-3 py-2.5 text-left"
                            onClick={() => {
                              onSelect(entry);
                              onClose();
                            }}
                          >
                            {/* Prompt — the "question", shown prominently */}
                            <p className={[
                              "text-[12.5px] leading-snug line-clamp-2",
                              isActive ? "text-white" : "text-white/75",
                            ].join(" ")}>
                              {entry.prompt}
                            </p>
                            {/* Title + time */}
                            <div className="mt-1 flex items-center justify-between gap-2">
                              <span className="truncate text-[10px] text-white/30">
                                {entry.title}
                              </span>
                              <span className="shrink-0 text-[10px] text-white/25">
                                {relativeTime(entry.savedAt)}
                              </span>
                            </div>
                          </button>

                          {/* Delete button — appears on hover */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemove(entry.id);
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 hidden h-6 w-6 items-center justify-center rounded text-white/25 transition-colors hover:bg-rose-500/20 hover:text-rose-400 group-hover:flex"
                            title="Remove"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {history.length > 0 && (
              <div className="shrink-0 border-t border-white/6 px-4 py-3">
                <button
                  onClick={() => {
                    onClearAll();
                    onClose();
                  }}
                  className="w-full rounded-md border border-white/6 bg-white/2 py-1.5 text-[11px] font-medium text-white/35 transition-colors hover:border-rose-400/20 hover:bg-rose-400/4 hover:text-rose-400/70"
                >
                  Clear all history
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
