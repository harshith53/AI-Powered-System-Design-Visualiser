import { z } from "zod";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Accepts string or number, coerces to number, defaults to 0 on failure */
const CoercedNumber = z.coerce.number().catch(0);

/** Accepts null / undefined / non-array → falls back to empty array */
function safeArray<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess((v) => (Array.isArray(v) ? v : []), z.array(schema));
}

/** Lower-cases a string before piping into an enum */
function lowerEnum<T extends [string, ...string[]]>(values: T) {
  return z
    .string()
    .transform((s) => s.toLowerCase().trim())
    .pipe(z.enum(values))
    .catch(values[0]);
}

// ─── Node type ────────────────────────────────────────────────────────────────
// AI commonly returns "database", "api", "gateway", "queue" — map them to the
// closest valid type instead of rejecting the whole response.
const NODE_TYPE_MAP: Record<string, string> = {
  database:    "cache",
  db:          "cache",
  redis:       "cache",
  queue:       "service",
  broker:      "service",
  api:         "server",
  gateway:     "edge",
  "api-gateway": "edge",
  cdn:         "edge",
  proxy:       "edge",
  worker:      "logic",
  processor:   "logic",
  monitor:     "observability",
  metrics:     "observability",
  logging:     "observability",
  tracing:     "observability",
};

const VALID_NODE_TYPES = [
  "client", "edge", "loadbalancer", "server",
  "cache", "logic", "service", "observability",
] as const;

const NodeTypeSchema = z
  .string()
  .transform((s) => {
    const lower = s.toLowerCase().trim();
    return NODE_TYPE_MAP[lower] ?? lower;
  })
  .pipe(z.enum(VALID_NODE_TYPES))
  .catch("service"); // unknown type → service

// ─── Edge kind ────────────────────────────────────────────────────────────────
const EdgeKindSchema = lowerEnum(["request", "shared", "reject", "telemetry"]);

// ─── Node ─────────────────────────────────────────────────────────────────────
const ArchitectureNodeSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  sublabel: z.string().optional(),
  type: NodeTypeSchema,
  description: z.string().catch(""),
  risks: safeArray(z.string()),
  notes: safeArray(z.string()),
  position: z.object({
    x: CoercedNumber,
    y: CoercedNumber,
  }).catch({ x: 0, y: 0 }),
});

// ─── Edge ─────────────────────────────────────────────────────────────────────
const ArchitectureEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  label: z.string().optional(),
  kind: EdgeKindSchema.optional(),
});

// ─── Animation step ───────────────────────────────────────────────────────────
const AnimationStepSchema = z.object({
  id: z.string().min(1),
  title: z.string().catch("Step"),
  description: z.string().catch(""),
  activeNodes: safeArray(z.string()),
  activeEdges: safeArray(z.string()),
});

// ─── Full blueprint ───────────────────────────────────────────────────────────
export const BlueprintSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(120),
  summary: z.string().catch(""),
  hldMermaid: z.string().optional(),
  lldMermaid: z.string().optional(),
  nodes: z.array(ArchitectureNodeSchema).min(1),
  edges: safeArray(ArchitectureEdgeSchema),
  steps: safeArray(AnimationStepSchema),
  lldNodes: z.array(ArchitectureNodeSchema).optional(),
  lldEdges: safeArray(ArchitectureEdgeSchema).optional(),
  rootCauses: z
    .array(
      z.object({
        cause: z.string(),
        probability: lowerEnum(["high", "medium", "low"]),
        detectionMetric: z.string().catch(""),
      }),
    )
    .optional(),
  solutions: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
        tradeoffs: z.string().catch(""),
        effort: lowerEnum(["low", "medium", "high"]),
      }),
    )
    .optional(),
  requestFlow: z
    .array(
      z.object({
        from: z.string(),
        to: z.string(),
        protocol: z.string().catch("HTTP"),
        note: z.string().catch(""),
      }),
    )
    .optional(),
  scalingNotes: z
    .array(
      z.object({
        dimension: lowerEnum(["horizontal", "vertical", "database", "cache", "cdn"]),
        suggestion: z.string(),
      }),
    )
    .optional(),
  interviewQuestions: safeArray(z.string()).optional(),
});

export type BlueprintSchemaType = z.infer<typeof BlueprintSchema>;
