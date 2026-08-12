"use client";

import { useEffect, useState } from "react";
import type { ViewMode, WorkspaceMode } from "@/types/architecture";
import type { HistoryEntry } from "@/hooks/useLocalHistory";

type Props = {
  workspaceMode: WorkspaceMode;
  onChangeWorkspaceMode: (mode: WorkspaceMode) => void;
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
  onExport: () => void;
  onShare: () => void;
  historyOpen?: boolean;
  onToggleHistory: () => void;
};

export function PromptToolbar({
  workspaceMode,
  onChangeWorkspaceMode,
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
  onExport,
  onShare,
  historyOpen = false,
  onToggleHistory,
}: Props) {
  const [draft, setDraft] = useState(prompt);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isPaletteKey = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (!isPaletteKey) return;
      event.preventDefault();
      setCommandOpen(true);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const generateNow = () => {
    if (draft.trim() && !isLoading) {
      onSubmitPrompt(draft.trim());
    }
  };

  const commandActions = [
      {
        id: "generate",
        label: "Generate Blueprint",
        keywords: "design generate prompt",
        run: () => {
          onChangeWorkspaceMode("design");
          generateNow();
          setCommandOpen(false);
        },
      },
      {
        id: "switch-design",
        label: "Switch to Design",
        keywords: "mode design",
        run: () => {
          onChangeWorkspaceMode("design");
          setCommandOpen(false);
        },
      },
      {
        id: "switch-analyze",
        label: "Switch to Analyze",
        keywords: "mode analyze analysis",
        run: () => {
          onChangeWorkspaceMode("analyze");
          setCommandOpen(false);
        },
      },
      {
        id: "switch-library",
        label: "Switch to Library",
        keywords: "mode library history",
        run: () => {
          onChangeWorkspaceMode("library");
          setCommandOpen(false);
        },
      },
      {
        id: "switch-share",
        label: "Switch to Share",
        keywords: "mode share export",
        run: () => {
          onChangeWorkspaceMode("share");
          setCommandOpen(false);
        },
      },
      {
        id: "toggle-analysis",
        label: analysisOpen ? "Close Analysis" : "Open Analysis",
        keywords: "analysis panel",
        run: () => {
          onToggleAnalysis();
          setCommandOpen(false);
        },
      },
      {
        id: "toggle-history",
        label: historyOpen ? "Close History" : "Open History",
        keywords: "history sidebar library",
        run: () => {
          onToggleHistory();
          setCommandOpen(false);
        },
      },
      {
        id: "toggle-play",
        label: isPlaying ? "Pause Timeline" : "Play Timeline",
        keywords: "play pause timeline",
        run: () => {
          onTogglePlay();
          setCommandOpen(false);
        },
      },
      {
        id: "fit-view",
        label: "Fit Canvas View",
        keywords: "fit view canvas",
        run: () => {
          onFitView();
          setCommandOpen(false);
        },
      },
      {
        id: "copy-share",
        label: "Copy Share Link",
        keywords: "share link copy",
        run: () => {
          onShare();
          setCommandOpen(false);
        },
      },
      {
        id: "export-json",
        label: "Export Blueprint JSON",
        keywords: "export json",
        run: () => {
          onExport();
          setCommandOpen(false);
        },
      },
      {
        id: "open-settings",
        label: "Open AI Settings",
        keywords: "settings configure ai",
        run: () => {
          onOpenSettings();
          setCommandOpen(false);
        },
      },
    ];

  const filteredCommands = commandActions.filter((action) => {
    const haystack = `${action.label} ${action.keywords}`.toLowerCase();
    return haystack.includes(commandQuery.trim().toLowerCase());
  });

  return (
    <header className="shrink-0 border-b border-white/10 bg-[#0a0f17]/95 backdrop-blur">
      <div className="flex h-13 items-center gap-3 px-4">
        <div className="flex items-center gap-2 pr-1">
          <div className="grid h-7 w-7 place-items-center rounded-md border border-white/10 bg-white/4 text-sky-300">
            <span className="text-[15px] leading-none">◇</span>
          </div>
          <div className="leading-tight">
            <div className="text-[13px] font-medium tracking-tight text-white">
              System Designer
            </div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
              workflow shell
            </div>
          </div>
        </div>

        <div className="mx-2 h-7 w-px bg-white/10" />

        <GlobalModeBar
          mode={workspaceMode}
          onChange={(mode) => {
            onChangeWorkspaceMode(mode);
            setQuickActionsOpen(false);
          }}
          hasAnalysisData={hasAnalysisData}
          historyCount={history.length}
        />

        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={() => setCommandOpen(true)}
            title="Open command palette"
            className="flex h-8 items-center gap-1.5 rounded-md border border-white/10 bg-white/3 px-2.5 text-[11px] text-white/60 transition-colors hover:border-white/20 hover:text-white"
          >
            ⌘K
          </button>
          <button
            onClick={onOpenSettings}
            title="AI settings"
            className={[
              "flex h-8 items-center gap-1 rounded-md border px-2.5 text-[11px] transition-colors",
              isConfigured
                ? "border-white/10 bg-white/3 text-white/70 hover:border-white/20 hover:text-white"
                : "border-amber-400/40 bg-amber-400/10 text-amber-300 hover:border-amber-400/60",
            ].join(" ")}
          >
            {isConfigured ? "⚙" : "⚠"}
          </button>
          <div className="relative">
            <button
              onClick={() => setQuickActionsOpen((open) => !open)}
              title="More actions"
              className="flex h-8 items-center gap-1 rounded-md border border-white/10 bg-white/3 px-2.5 text-[11px] text-white/70 transition-colors hover:border-white/20 hover:text-white"
            >
              ⋯
            </button>
            {quickActionsOpen && (
              <div className="absolute right-0 top-9 z-40 min-w-48 rounded-md border border-white/10 bg-[#0f1622] p-1.5 shadow-xl">
                <QuickActionButton label={isPlaying ? "Pause timeline" : "Play timeline"} onClick={() => { onTogglePlay(); setQuickActionsOpen(false); }} />
                <QuickActionButton label="Fit canvas" onClick={() => { onFitView(); setQuickActionsOpen(false); }} />
                <QuickActionButton label="Open analyze mode" onClick={() => { onChangeWorkspaceMode("analyze"); setQuickActionsOpen(false); }} />
                <QuickActionButton label="Open library mode" onClick={() => { onChangeWorkspaceMode("library"); setQuickActionsOpen(false); }} />
                <div className="my-1 h-px bg-white/10" />
                <QuickActionButton label="Copy share link" onClick={() => { onShare(); setQuickActionsOpen(false); }} />
                <QuickActionButton label="Export JSON" onClick={() => { onExport(); setQuickActionsOpen(false); }} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-white/6 px-4 py-2">
        <ContextActionBar
          mode={workspaceMode}
          draft={draft}
          setDraft={setDraft}
          isLoading={isLoading}
          errorMessage={errorMessage}
          viewMode={viewMode}
          onChangeViewMode={onChangeViewMode}
          onGenerate={generateNow}
          onToggleAnalysis={onToggleAnalysis}
          analysisOpen={analysisOpen}
          hasAnalysisData={hasAnalysisData}
          historyOpen={historyOpen}
          historyCount={history.length}
          onToggleHistory={onToggleHistory}
          onShare={onShare}
          onExport={onExport}
        />
      </div>

      {commandOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 p-4 backdrop-blur-sm" onClick={() => setCommandOpen(false)}>
          <div className="mx-auto mt-20 max-w-xl rounded-lg border border-white/10 bg-[#0f1622] p-3 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <input
              autoFocus
              value={commandQuery}
              onChange={(event) => setCommandQuery(event.target.value)}
              placeholder="Type a command..."
              className="h-10 w-full rounded-md border border-white/10 bg-white/3 px-3 text-[13px] text-white placeholder:text-white/35 focus:border-sky-400/50 focus:outline-none"
            />
            <div className="mt-2 max-h-72 overflow-auto rounded-md border border-white/10">
              {filteredCommands.length > 0 ? (
                filteredCommands.map((action) => (
                  <button
                    key={action.id}
                    onClick={action.run}
                    className="flex w-full items-center justify-between border-b border-white/6 px-3 py-2 text-left text-[12px] text-white/80 transition-colors last:border-b-0 hover:bg-white/5"
                  >
                    <span>{action.label}</span>
                    <span className="text-[10px] uppercase tracking-[0.14em] text-white/35">cmd</span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-[12px] text-white/35">No matching commands</div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function GlobalModeBar({
  mode,
  onChange,
  hasAnalysisData,
  historyCount,
}: {
  mode: WorkspaceMode;
  onChange: (mode: WorkspaceMode) => void;
  hasAnalysisData: boolean;
  historyCount: number;
}) {
  const modes: Array<{ id: WorkspaceMode; label: string; badge?: string }> = [
    { id: "design", label: "Design" },
    { id: "analyze", label: "Analyze", badge: hasAnalysisData ? "●" : undefined },
    { id: "library", label: "Library", badge: historyCount > 0 ? String(historyCount) : undefined },
    { id: "share", label: "Share" },
  ];

  return (
    <nav className="flex h-8 items-center gap-0.5 rounded-md border border-white/10 bg-white/3 p-0.5">
      {modes.map((item) => {
        const active = mode === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={[
              "h-7 min-w-16 rounded px-2 text-[11px] font-semibold tracking-wide transition-colors",
              active
                ? "bg-white/10 text-white"
                : "text-white/50 hover:text-white/80",
            ].join(" ")}
          >
            {item.label}
            {item.badge ? <span className="ml-1 text-[9px] text-sky-300">{item.badge}</span> : null}
          </button>
        );
      })}
    </nav>
  );
}

function ContextActionBar({
  mode,
  draft,
  setDraft,
  isLoading,
  errorMessage,
  viewMode,
  onChangeViewMode,
  onGenerate,
  onToggleAnalysis,
  analysisOpen,
  hasAnalysisData,
  historyOpen,
  historyCount,
  onToggleHistory,
  onShare,
  onExport,
}: {
  mode: WorkspaceMode;
  draft: string;
  setDraft: (value: string) => void;
  isLoading: boolean;
  errorMessage?: string | null;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  onGenerate: () => void;
  onToggleAnalysis: () => void;
  analysisOpen: boolean;
  hasAnalysisData: boolean;
  historyOpen: boolean;
  historyCount: number;
  onToggleHistory: () => void;
  onShare: () => void;
  onExport: () => void;
}) {
  if (mode === "design") {
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onGenerate();
        }}
        className="flex min-w-0 flex-col gap-1"
      >
        <div className="flex min-w-0 items-center gap-2">
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
              onChange={(event) => setDraft(event.target.value)}
              disabled={isLoading}
              placeholder="How does distributed rate limiting work in production?"
              className="h-9 min-w-0 flex-1 bg-transparent text-[13px] text-white placeholder:text-white/30 focus:outline-none disabled:opacity-50"
            />
          </div>
          <ModeToggle value={viewMode} onChange={onChangeViewMode} />
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
        {errorMessage ? <p className="pl-1 text-[11px] text-rose-400">{errorMessage}</p> : null}
      </form>
    );
  }

  if (mode === "analyze") {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleAnalysis}
          className={[
            "flex h-9 items-center gap-1.5 rounded-md border px-3 text-[12px] font-medium transition-colors",
            analysisOpen
              ? "border-sky-400/60 bg-sky-400/15 text-sky-200"
              : hasAnalysisData
                ? "border-white/10 bg-white/3 text-white/70 hover:border-white/20 hover:text-white"
                : "border-white/10 bg-white/3 text-white/30",
          ].join(" ")}
        >
          <span>{analysisOpen ? "✕" : "≡"}</span>
          {analysisOpen ? "Close analysis" : "Open analysis"}
        </button>
        <span className="text-[11px] text-white/35">Tabs: Root Causes, Solutions, Diagrams, Flow, Scaling, Interview</span>
      </div>
    );
  }

  if (mode === "library") {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleHistory}
          className={[
            "flex h-9 items-center gap-1.5 rounded-md border px-3 text-[12px] font-medium transition-colors",
            historyOpen
              ? "border-sky-400/40 bg-sky-400/10 text-sky-200"
              : "border-white/10 bg-white/3 text-white/60 hover:border-white/20 hover:text-white",
          ].join(" ")}
        >
          <span>⏱</span>
          {historyOpen ? "Close history" : "Open history"}
          {historyCount > 0 ? (
            <span className="rounded bg-white/10 px-1 py-0.5 text-[9px] font-bold text-white/50">{historyCount}</span>
          ) : null}
        </button>
        <span className="text-[11px] text-white/35">Browse recent blueprints and reopen previous sessions.</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onShare}
        className="flex h-9 items-center gap-1.5 rounded-md border border-white/10 bg-white/3 px-3 text-[12px] text-white/75 transition-colors hover:border-white/20 hover:text-white"
      >
        🔗 Copy link
      </button>
      <button
        onClick={onExport}
        className="flex h-9 items-center gap-1.5 rounded-md border border-white/10 bg-white/3 px-3 text-[12px] text-white/75 transition-colors hover:border-white/20 hover:text-white"
      >
        ⤓ Export JSON
      </button>
      <span className="text-[11px] text-white/35">Share and export artifacts from one dedicated mode.</span>
    </div>
  );
}

function QuickActionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center rounded px-2 py-1.5 text-left text-[11px] text-white/75 transition-colors hover:bg-white/5 hover:text-white"
    >
      {label}
    </button>
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
      {(["HLD", "LLD"] as const).map((mode) => {
        const active = value === mode;
        return (
          <button
            key={mode}
            onClick={() => onChange(mode)}
            className={[
              "h-7 min-w-11 rounded px-2 text-[11px] font-semibold tracking-wide transition-colors",
              active ? "bg-white/10 text-white" : "text-white/50 hover:text-white/80",
            ].join(" ")}
          >
            {mode}
          </button>
        );
      })}
    </div>
  );
}
