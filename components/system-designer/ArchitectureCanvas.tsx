"use client";

import { useEffect, useMemo } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import type {
  ArchitectureBlueprint,
  ArchitectureEdge,
  EdgeKind,
} from "@/types/architecture";
import { SystemNode, type SystemNodeData } from "./SystemNode";

const nodeTypes = { system: SystemNode };

const EDGE_STROKE: Record<EdgeKind, string> = {
  request: "#7dd3fc",
  shared: "#f0abfc",
  reject: "#fb7185",
  telemetry: "#67e8f9",
};

const EDGE_DIM = "rgba(148,163,184,0.22)";

type Props = {
  blueprint: ArchitectureBlueprint;
  activeNodeIds: string[];
  activeEdgeIds: string[];
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  fitSignal: number;
  viewMode?: "HLD" | "LLD";
};

function buildNodes(
  bp: ArchitectureBlueprint,
  activeNodeIds: string[],
  selectedNodeId: string | null,
): Node[] {
  const activeSet = new Set(activeNodeIds);
  return bp.nodes.map<Node>((n) => ({
    id: n.id,
    type: "system",
    position: n.position,
    data: {
      label: n.label,
      sublabel: n.sublabel,
      type: n.type,
      active: activeSet.has(n.id),
      selected: selectedNodeId === n.id,
    } satisfies SystemNodeData as unknown as Record<string, unknown>,
  }));
}

function buildEdges(
  bp: ArchitectureBlueprint,
  activeEdgeIds: string[],
): Edge[] {
  const activeSet = new Set(activeEdgeIds);
  return bp.edges.map<Edge>((e: ArchitectureEdge) => {
    const kind: EdgeKind = e.kind ?? "request";
    const isActive = activeSet.has(e.id);
    const color = isActive ? EDGE_STROKE[kind] : EDGE_DIM;
    const isReject = kind === "reject";
    return {
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      animated: isActive,
      style: {
        stroke: color,
        strokeWidth: isActive ? 2 : 1.25,
        strokeDasharray: isReject ? "6 4" : undefined,
        filter: isActive
          ? `drop-shadow(0 0 6px ${color})`
          : undefined,
      },
      labelStyle: {
        fill: isActive ? "#e2e8f0" : "#64748b",
        fontSize: 10,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      },
      labelBgStyle: {
        fill: "#0a0f17",
        opacity: 0.85,
      },
      labelBgPadding: [4, 2],
      labelBgBorderRadius: 4,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color,
        width: 16,
        height: 16,
      },
    };
  });
}

function CanvasInner({
  blueprint,
  activeNodeIds,
  activeEdgeIds,
  selectedNodeId,
  onSelectNode,
  fitSignal,
  viewMode = "HLD",
}: Props) {
  // Use LLD data when available and LLD mode is active
  const useLLD = viewMode === "LLD" && (blueprint.lldNodes?.length ?? 0) > 0;
  const activeBp = useLLD
    ? { ...blueprint, nodes: blueprint.lldNodes!, edges: blueprint.lldEdges ?? [] }
    : blueprint;

  const initialNodes = useMemo(
    () => buildNodes(activeBp, activeNodeIds, selectedNodeId),
    // initial only — subsequent updates handled in effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [blueprint.id, viewMode],
  );
  const initialEdges = useMemo(
    () => buildEdges(activeBp, activeEdgeIds),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [blueprint.id, viewMode],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { fitView } = useReactFlow();

  useEffect(() => {
    setNodes(buildNodes(activeBp, activeNodeIds, selectedNodeId));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blueprint, activeNodeIds, selectedNodeId, setNodes, viewMode]);

  useEffect(() => {
    setEdges(buildEdges(activeBp, activeEdgeIds));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blueprint, activeEdgeIds, setEdges, viewMode]);

  useEffect(() => {
    if (fitSignal === 0) return;
    fitView({ padding: 0.2, duration: 400 });
  }, [fitSignal, fitView]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={(_, n) => onSelectNode(n.id)}
      onPaneClick={() => onSelectNode(null)}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      minZoom={0.3}
      maxZoom={1.6}
      proOptions={{ hideAttribution: true }}
      colorMode="dark"
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={24}
        size={1}
        color="rgba(148,163,184,0.18)"
      />
      <Controls
        position="bottom-right"
        showInteractive={false}
        className="rounded-md! border! border-white/10! bg-[#0e131b]! shadow-none!"
      />
    </ReactFlow>
  );
}

export function ArchitectureCanvas(props: Props) {
  return (
    <div className="h-full w-full">
      <ReactFlowProvider>
        <CanvasInner {...props} />
      </ReactFlowProvider>
    </div>
  );
}
