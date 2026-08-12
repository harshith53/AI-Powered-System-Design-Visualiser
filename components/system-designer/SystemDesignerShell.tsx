"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type {
  ArchitectureBlueprint,
  ViewMode,
  WorkspaceMode,
} from "@/types/architecture";
import { ArchitectureCanvas } from "./ArchitectureCanvas";
import { DetailsDrawer } from "./DetailsDrawer";
import { PromptToolbar } from "./PromptToolbar";
import { TimelineBar } from "./TimelineBar";
import { LoadingOverlay } from "./LoadingOverlay";
import { SettingsPanel } from "./SettingsPanel";
import { AnalysisPanel } from "./AnalysisPanel";
import { HistorySidebar } from "./HistorySidebar";
import { useGenerateBlueprint } from "@/hooks/useGenerateBlueprint";
import { useAIConfig } from "@/hooks/useAIConfig";
import { useLocalHistory } from "@/hooks/useLocalHistory";
import { useURLState } from "@/hooks/useURLState";

type Props = {
  initialBlueprint: ArchitectureBlueprint;
};

const PLAYBACK_INTERVAL_MS = 1500;

export function SystemDesignerShell({ initialBlueprint }: Props) {
  const [blueprint, setBlueprint] = useState<ArchitectureBlueprint>(initialBlueprint);
  const [viewMode, setViewMode] = useState<ViewMode>("HLD");
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>("design");
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [fitSignal, setFitSignal] = useState(0);

  const { state: generateState, generate } = useGenerateBlueprint();
  const isLoading = generateState.status === "loading";
  const errorMessage = generateState.status === "error" ? generateState.message : null;

  const { config: aiConfig, setConfig, isConfigured } = useAIConfig();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(false);

  const { history, save: saveToHistory, remove: removeFromHistory, clear: clearHistory } = useLocalHistory();
  const { getShareURL } = useURLState(blueprint.prompt, (prompt) => generate(prompt, aiConfig));

  const [copyToast, setCopyToast] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Clean up toast timeout
  useEffect(() => {
    if (!copyToast) return;
    const timer = setTimeout(() => setCopyToast(null), 2500);
    return () => clearTimeout(timer);
  }, [copyToast]);

  const hasAnalysisData =
    (blueprint.rootCauses?.length ?? 0) > 0 ||
    (blueprint.solutions?.length ?? 0) > 0 ||
    !!blueprint.hldMermaid;

  const currentStep = blueprint.steps[stepIndex] ?? null;
  const activeNodeIds = currentStep?.activeNodes ?? [];
  const activeEdgeIds = currentStep?.activeEdges ?? [];

  const selectedNode = useMemo(
    () => blueprint.nodes.find((n) => n.id === selectedNodeId) ?? null,
    [blueprint, selectedNodeId],
  );

  useEffect(() => {
    if (!isPlaying) return;
    const t = setInterval(() => {
      setStepIndex((i) => {
        const next = i + 1;
        if (next >= blueprint.steps.length) {
          setIsPlaying(false);
          return blueprint.steps.length - 1;
        }
        return next;
      });
    }, PLAYBACK_INTERVAL_MS);
    return () => clearInterval(t);
  }, [isPlaying, blueprint.steps.length]);

  // When AI returns a new blueprint, load it + save to history
  useEffect(() => {
    if (generateState.status === "success") {
      const bp = generateState.blueprint;
      setBlueprint(bp);
      setStepIndex(0);
      setIsPlaying(false);
      setSelectedNodeId(null);
      setFitSignal((n) => n + 1);
      setAnalysisOpen(true);
      saveToHistory(bp);
    }
  }, [generateState, saveToHistory]);

  const handleSubmitPrompt = useCallback((next: string) => {
    generate(next, aiConfig);
  }, [generate, aiConfig]);

  const handleChangeWorkspaceMode = useCallback((nextMode: WorkspaceMode) => {
    setWorkspaceMode(nextMode);

    if (nextMode === "analyze") {
      setAnalysisOpen(true);
      setHistoryOpen(false);
      setSelectedNodeId(null);
      return;
    }

    if (nextMode === "library") {
      setHistoryOpen(true);
      setAnalysisOpen(false);
      setSelectedNodeId(null);
      return;
    }

    if (nextMode === "share" || nextMode === "design") {
      setHistoryOpen(false);
      setAnalysisOpen(false);
      return;
    }
  }, []);

  const handleSelectHistory = useCallback((entry: import("@/hooks/useLocalHistory").HistoryEntry) => {
    setBlueprint(entry.blueprint);
    setStepIndex(0);
    setIsPlaying(false);
    setSelectedNodeId(null);
    setFitSignal((n) => n + 1);
    setAnalysisOpen(true);
  }, []);

  const handleExport = useCallback(() => {
    try {
      const json = JSON.stringify(blueprint, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = `system-design-${blueprint.id}.json`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(url);
      setCopyToast("Blueprint exported!");
    } catch (err) {
      console.error("Export failed:", err);
      setCopyToast("Export failed. Please try again.");
    }
  }, [blueprint]);

  const handleShare = useCallback(async () => {
    const url = getShareURL();
    try {
      await navigator.clipboard.writeText(url);
      setCopyToast("Link copied!");
    } catch {
      setCopyToast(url);
    }
  }, [getShareURL]);

  const handleTogglePlay = useCallback(() => {
    setIsPlaying((p) => {
      const next = !p;
      if (next && stepIndex >= blueprint.steps.length - 1) {
        setStepIndex(0);
      }
      return next;
    });
  }, [stepIndex, blueprint.steps.length]);

  const handleSelectStep = useCallback(
    (i: number) => {
      setStepIndex(i);
      setIsPlaying(false);
    },
    [],
  );

  const drawerOpen = selectedNode !== null;

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-[#070b11] text-white">
        <PromptToolbar
          key={blueprint.id}
          workspaceMode={workspaceMode}
          onChangeWorkspaceMode={handleChangeWorkspaceMode}
        prompt={blueprint.prompt}
        onSubmitPrompt={handleSubmitPrompt}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onFitView={() => setFitSignal((n) => n + 1)}
        isLoading={isLoading}
        errorMessage={errorMessage}
        isConfigured={isConfigured}
        onOpenSettings={() => setSettingsOpen(true)}
        analysisOpen={analysisOpen}
        onToggleAnalysis={() => {
          setAnalysisOpen((o) => !o);
          if (!analysisOpen) {
            setSelectedNodeId(null);
            setHistoryOpen(false);
            setWorkspaceMode("analyze");
          } else {
            setWorkspaceMode("design");
          }
        }}
        hasAnalysisData={hasAnalysisData}
        history={history}
        onExport={handleExport}
        onShare={handleShare}
        historyOpen={historyOpen}
        onToggleHistory={() => {
          setHistoryOpen((o) => !o);
          if (!historyOpen) {
            setAnalysisOpen(false);
            setWorkspaceMode("library");
          } else {
            setWorkspaceMode("design");
          }
        }}
      />

      <div className="relative flex min-h-0 flex-1">
        <main className="relative min-w-0 flex-1">
          <BlueprintHeader blueprint={blueprint} viewMode={viewMode} />
          <div className="absolute inset-0">
            <ArchitectureCanvas
              blueprint={blueprint}
              activeNodeIds={activeNodeIds}
              activeEdgeIds={activeEdgeIds}
              selectedNodeId={selectedNodeId}
              onSelectNode={(id) => {
                setSelectedNodeId(id);
                if (id) setAnalysisOpen(false);
              }}
              fitSignal={fitSignal}
              viewMode={viewMode}
            />
            {isLoading && <LoadingOverlay />}
          </div>
          <ModeBadge viewMode={viewMode} />
          <CanvasControlDock
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            onFitView={() => setFitSignal((n) => n + 1)}
          />
        </main>
        <DetailsDrawer
          open={drawerOpen}
          onClose={() => setSelectedNodeId(null)}
          node={selectedNode}
          currentStep={currentStep}
        />

        <AnalysisPanel
          open={analysisOpen}
          onClose={() => setAnalysisOpen(false)}
          blueprint={blueprint}
        />

        <HistorySidebar
          open={historyOpen && !analysisOpen}
          onClose={() => setHistoryOpen(false)}
          history={history}
          onSelect={(entry) => {
            handleSelectHistory(entry);
            setHistoryOpen(false);
            setAnalysisOpen(true);
          }}
          onRemove={removeFromHistory}
          onClearAll={clearHistory}
          activeId={blueprint.id}
        />
      </div>

      <TimelineBar
        steps={blueprint.steps}
        currentIndex={stepIndex}
        isPlaying={isPlaying}
        onSelect={handleSelectStep}
      />

      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        config={aiConfig}
        onSave={setConfig}
      />

      {/* Copy toast */}
      {copyToast && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-emerald-400/30 bg-[#0d1420] px-4 py-2.5 text-[12px] text-emerald-300 shadow-xl">
          {copyToast}
        </div>
      )}
    </div>
  );
}

function CanvasControlDock({
  isPlaying,
  onTogglePlay,
  onFitView,
}: {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onFitView: () => void;
}) {
  return (
    <div className="pointer-events-auto absolute left-4 top-24 z-10 flex items-center gap-2 rounded-md border border-white/10 bg-[#0a0f17]/85 px-2 py-1.5 backdrop-blur">
      <button
        onClick={onTogglePlay}
        className="flex h-8 items-center gap-1 rounded-md border border-white/10 bg-white/3 px-2.5 text-[11px] text-white/80 transition-colors hover:border-white/20 hover:text-white"
      >
        <span className={isPlaying ? "text-rose-300" : "text-emerald-300"}>{isPlaying ? "❚❚" : "▶"}</span>
        {isPlaying ? "Pause" : "Play"}
      </button>
      <button
        onClick={onFitView}
        className="h-8 rounded-md border border-white/10 bg-white/3 px-2.5 text-[11px] text-white/80 transition-colors hover:border-white/20 hover:text-white"
      >
        Fit
      </button>
    </div>
  );
}

function BlueprintHeader({
  blueprint,
  viewMode,
}: {
  blueprint: ArchitectureBlueprint;
  viewMode: ViewMode;
}) {
  return (
    <div className="pointer-events-none absolute left-4 top-4 z-10 max-w-130">
      <motion.div
        key={blueprint.id + viewMode}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="pointer-events-auto rounded-md border border-white/10 bg-[#0a0f17]/85 px-3 py-2 backdrop-blur"
      >
        <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
          Blueprint
        </div>
        <div className="mt-0.5 text-[13px] font-semibold tracking-tight text-white">
          {blueprint.title}
        </div>
        <div className="mt-1 max-w-120 text-[11.5px] leading-relaxed text-white/55">
          {blueprint.summary}
        </div>
      </motion.div>
    </div>
  );
}

function ModeBadge({ viewMode }: { viewMode: ViewMode }) {
  return (
    <div className="pointer-events-none absolute right-4 top-4 z-10">
      <div className="rounded-md border border-white/10 bg-[#0a0f17]/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55 backdrop-blur">
        <span className="mr-1.5 inline-block h-1.5 w-1.5 -translate-y-px rounded-full bg-sky-400 align-middle" />
        {viewMode} view
      </div>
    </div>
  );
}
