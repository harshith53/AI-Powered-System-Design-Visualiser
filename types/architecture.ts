export type ViewMode = "HLD" | "LLD";

export type NodeType =
  | "client"
  | "edge"
  | "loadbalancer"
  | "server"
  | "cache"
  | "logic"
  | "service"
  | "observability";

export type ArchitectureNode = {
  id: string;
  label: string;
  type: NodeType;
  description: string;
  risks: string[];
  notes: string[];
  /** Layout position on canvas */
  position: { x: number; y: number };
  /** Optional sublabel shown under primary label */
  sublabel?: string;
};

export type EdgeKind = "request" | "shared" | "reject" | "telemetry";

export type ArchitectureEdge = {
  id: string;
  source: string;
  target: string;
  label?: string;
  kind?: EdgeKind;
};

export type AnimationStep = {
  id: string;
  title: string;
  description: string;
  activeNodes: string[];
  activeEdges: string[];
};

export type RootCause = {
  cause: string;
  probability: "high" | "medium" | "low";
  detectionMetric: string;
};

export type Solution = {
  title: string;
  description: string;
  tradeoffs: string;
  effort: "low" | "medium" | "high";
};

export type RequestFlowStep = {
  from: string;
  to: string;
  protocol: string;
  note: string;
};

export type ScalingNote = {
  dimension: "horizontal" | "vertical" | "database" | "cache" | "cdn";
  suggestion: string;
};

export type ArchitectureBlueprint = {
  id: string;
  prompt: string;
  title: string;
  summary: string;
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  steps: AnimationStep[];
  // AI-generated fields (optional so static blueprints stay valid)
  hldMermaid?: string;
  lldMermaid?: string;
  lldNodes?: ArchitectureNode[];
  lldEdges?: ArchitectureEdge[];
  rootCauses?: RootCause[];
  solutions?: Solution[];
  requestFlow?: RequestFlowStep[];
  scalingNotes?: ScalingNote[];
  interviewQuestions?: string[];
};
