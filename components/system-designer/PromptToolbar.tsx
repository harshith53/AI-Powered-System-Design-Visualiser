"use client";

import { useState } from "react";
import type { ViewMode } from "@/types/architecture";
import type { HistoryEntry } from "@/hooks/useLocalHistory";

type Props = {
  prompt: string;
  onSubmitPrompt: (prompt: string) => void;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onFitView: () => void;
  isLoading?: boolean;
  errorMessage?: string | null;
  isConfigured?: boolean;
  onOpenSettings: () => void;
  analysisOpen?: boolean;
  onToggleAnalysis: () => void;
  hasAnalysisData?: boolean;
  history?: HistoryEntry[];
  onSelectHistory: (entry: HistoryEntry) => void;
  onExport: () => void;
  onShare: () => void;
  historyOpen?: boolean;
  onToggleHistory: () => void;
};

export function PromptToolbar({
  prompt,
  onSubmitPrompt,
  viewMode,
  onChangeViewMode,
  isPlaying,
  onTogglePlay,
  onFitView,
  isLoading = false,
  errorMessage,
  isConfigured = false,
  onOpenSettings,
  analysisOpen = false,
  onToggleAnalysis,
  hasAnalysisData = false,
  history = [],
  onSelectHistory,
  onExport,
  onShare,
  historyOpen = false,
  onToggleHistory,
}: Props) {
  const [draft, setDraft] = useState(prompt);

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-white/10 bg-[#0a0f17]/95 px-4 backdrop-blur">
      <div className="flex items-center gap-2 pr-2">
        <div className="grid h-7 w-7 place-items-center rounded-md border border-white/10 bg-white/4 text-sky-300">
          <span className="text-[15px] leading-none">◇</span>
        </div>
        <div className="leading-tight">
          <div className="text-[13px] font-medium tracking-tight text-white">
            System Designer
          </div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
            wireframe · v0
          </div>
        </div>
      </div>

      <div className="mx-2 h-7 w-px bg-white/10" />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (draft.trim() && !isLoading) onSubmitPrompt(draft.trim());
        }}
        className="flex min-w-0 flex-1 flex-col gap-1"
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div
            className={[
              "flex min-w-0 flex-1 items-center gap-2 rounded-md border bg-white/3 px-3 transition-colors focus-within:bg-white/5",
              errorMessage
                ? "border-rose-400/50 focus-within:border-rose-400/70"
                : "border-white/10 focus-within:border-sky-400/50",
            ].join(" ")}
          >
            <span className="text-white/30">⌕</span>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              disabled={isLoading}
              placeholder="How does distributed rate limiting work in production?"
              className="h-9 min-w-0 flex-1 bg-transparent text-[13px] text-white placeholder:text-white/30 focus:outline-none disabled:opacity-50"
            />
            {!isLoading && (
              <kbd className="hidden rounded border border-white/10 bg-white/4 px-1.5 py-0.5 text-[10px] text-white/40 sm:inline-block">
                ⏎
              </kbd>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading || !draft.trim()}
            className="flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-sky-400/40 bg-sky-400/15 px-3 text-[12px] font-medium text-sky-200 transition-colors hover:border-sky-400/60 hover:bg-sky-400/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="inline-block h-3 w-3 animate-spin rounded-full border border-sky-300 border-t-transparent" />
                Generating
              </>
            ) : (
              "Generate"
            )}
          </button>
        </div>
        {errorMessage && (
          <p className="pl-1 text-[11px] text-rose-400">{errorMessage}</p>
        )}
      </form>

      <div className="mx-1 h-7 w-px bg-white/10" />

      <ModeToggle value={viewMode} onChange={onChangeViewMode} />

      <button
        onClick={onTogglePlay}
        className="flex h-9 items-center gap-1.5 rounded-md border border-white/10 bg-white/3 px-3 text-[12px] font-medium text-white/80 transition-colors hover:border-white/20 hover:bg-white/606]"
      >
        <span
          className={
            isPlaying ? "text-rose-300" : "text-emerald-300"
          }
        >
          {isPlaying ? "❚❚" : "▶"}
        </span>
        {isPlaying ? "Pause" : "Play"}
      </button>

      <button
        onClick={onFitView}
        className="h-9 rounded-md border border-white/10 bg-white/3 px-3 text-[12px] font-medium text-white/80 transition-colors hover:border-white/20 hover:bg-white/6"
      >
        Fit
      </button>

      {/* Analysis panel toggle */}
      <button
        onClick={onToggleAnalysis}
        title="Toggle analysis panel"
        className={[
          "flex h-9 items-center gap-1.5 rounded-md border px-3 text-[12px] font-medium transition-colors",
          analysisOpen
            ? "border-sky-400/60 bg-sky-400/15 text-sky-200"
            : hasAnalysisData
            ? "border-white/10 bg-white/3 text-white/70 hover:border-white/20 hover:text-white"
            : "border-white/10 bg-white/3 text-white/30",
        ].join(" ")}
      >
        <span className="text-[11px]">{analysisOpen ? "✕" : "≡"}</span>
        <span className="hidden sm:inline">Analysis</span>
        {hasAnalysisData && !analysisOpen && (
          <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
        )}
      </button>

      <div className="mx-1 h-7 w-px bg-white/10" />

      {/* Settings / API key button */}
      <button
        onClick={onOpenSettings}
        title="AI Provider Settings"
        className={[
          "flex h-9 items-center gap-1.5 rounded-md border px-3 text-[12px] font-medium transition-colors",
          isConfigured
            ? "border-white/10 bg-white/[0.03] text-white/70 hover:border-white/20 hover:text-white"
            : "border-amber-400/40 bg-amber-400/10 text-amber-300 hover:border-amber-400/60 hover:bg-amber-400/20",
        ].join(" ")}
      >
        <span className="text-[13px] leading-none">{isConfigured ? "⚙" : "⚠"}</span>
        <span className="hidden sm:inline">{isConfigured ? "" : "Configure AI"}</span>
      </button>

      {/* Share + Export + History */}
      <div className="flex items-center gap-1">
        <button
          onClick={onShare}
          title="Copy share link"
          className="h-9 rounded-md border border-white/10 bg-white/[0.03] px-2.5 text-[12px] text-white/60 transition-colors hover:border-white/20 hover:text-white"
        >
          🔗
        </button>
        <button
          onClick={onExport}
          title="Export JSON"
          className="h-9 rounded-md border border-white/10 bg-white/[0.03] px-2.5 text-[12px] text-white/60 transition-colors hover:border-white/20 hover:text-white"
        >
          ⤓
        </button>
        <button
          onClick={onToggleHistory}
          title="History"
          className={[
            "flex h-9 items-center gap-1.5 rounded-md border px-2.5 text-[12px] font-medium transition-colors",
            historyOpen
              ? "border-sky-400/40 bg-sky-400/10 text-sky-200"
              : "border-white/10 bg-white/3 text-white/60 hover:border-white/20 hover:text-white",
          ].join(" ")}
        >
          <span className="text-[11px]">⏱</span>
          <span className="hidden sm:inline">History</span>
          {history.length > 0 && (
            <span className="rounded bg-white/10 px-1 py-0.5 text-[9px] font-bold text-white/50">
              {history.length}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

function ModeToggle({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}) {
  return (
    <div className="flex h-9 items-center gap-0.5 rounded-md border border-white/10 bg-white/3 p-0.5">
      {(["HLD", "LLD"] as const).map((m) => {
        const active = value === m;
        return (
          <button
            key={m}
            onClick={() => onChange(m)}
            className={[
              "h-7 min-w-11 rounded text-[11px] font-semibold tracking-wide transition-colors",
              active
                ? "bg-white/10 text-white"
                : "text-white/50 hover:text-white/80",
            ].join(" ")}
          >
            {m}
          </button>
        );
      })}
    </div>
  );
}
