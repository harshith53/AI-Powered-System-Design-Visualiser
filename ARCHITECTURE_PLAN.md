# System Design App — AI Dynamic Architecture Plan

> **Status:** Planning  
> **Stack:** Next.js 16 · TypeScript · @xyflow/react · Framer Motion · Tailwind CSS 4  
> **AI Target:** OpenAI GPT-4o (primary), Anthropic Claude (secondary), Gemini (tertiary)

---

## 1. Current State Analysis

### What exists and works well
| Asset | File | Status |
|---|---|---|
| Canvas renderer | `ArchitectureCanvas.tsx` | ✅ Full ReactFlow graph |
| Node component | `SystemNode.tsx` | ✅ Typed, animated |
| Animated timeline | `TimelineBar.tsx` | ✅ Playback + step select |
| Sidebar drawer | `DetailsDrawer.tsx` | ✅ Risks, notes, step info |
| Prompt input | `PromptToolbar.tsx` | ✅ UI done, not wired to AI |
| Type system | `types/architecture.ts` | ✅ Clean, extensible |
| HLD/LLD toggle | `SystemDesignerShell.tsx` | ⚠️ Toggle exists, no separate LLD data |

### What is missing (gap analysis)
| Gap | Impact |
|---|---|
| `handleSubmitPrompt` updates `blueprint.prompt` only — no API call | App shows static rate-limiter demo for every prompt |
| No API route | No server-side AI execution |
| No prompt engineering layer | AI returns unstructured text |
| No JSON validator | Malformed AI responses crash UI |
| No loading / error states | Silent failures |
| No Mermaid rendering | Mermaid strings exist nowhere |
| No root cause / solutions panel | Output is diagram-only |
| LLD has no distinct node/edge data | HLD and LLD show same graph |
| No caching | Every identical prompt re-calls LLM ($$$) |
| No rate limiting on `/api/generate` | Open to abuse |

### 1.1 Deep analysis: what SystemDesigner needs in the 2026 developer world

This section translates current market expectations for developer tools into concrete product requirements for SystemDesigner. The focus is on practical utility, daily workflow integration, trust, and team adoption.

#### A. Product expectations benchmark (2026)

Modern developers expect architecture tools to provide:

1. Fast time-to-first-value (under 10 seconds for a useful draft)
2. High output reliability (structured, explainable, reproducible)
3. Team collaboration (share, review, version, compare)
4. Governance support (security, cost, SLOs, compliance)
5. Workflow integration (GitHub, Jira, Slack, docs, CI)
6. Learning and guidance (tradeoffs, alternatives, interview framing)

Current app strengths are in visualization and UX. The largest missing value is decision support and lifecycle integration.

#### B. Feature map by strategic value

| Domain | Why it matters now | Recommended features | Priority | Expected impact |
|---|---|---|---|---|
| Generation quality and trust | AI output quality is now the main differentiator | Multi-candidate generation, confidence scoring by section, deterministic seed mode, citation-backed recommendations | P0 | Higher user trust, fewer regenerations |
| Architecture correctness | Teams need realistic, production-grade outputs | Constraint-aware generation (scale, region, budget, latency), anti-pattern detector, resilience checklist | P0 | Better technical quality and fewer design blind spots |
| Developer workflow integration | Standalone tools have low daily retention | Export to Markdown/Mermaid/JSON, GitHub PR comment export, copy as ADR draft, Jira ticket seed | P0 | Higher adoption in real team workflows |
| Collaboration and review | Design is a team activity | Shared sessions, comments on nodes, diff between versions, reviewer mode | P1 | Improved team alignment and faster review cycles |
| Cost and operations intelligence | Architecture without cost/SLO is incomplete | Cost estimator per component, SLO/error-budget hints, scaling triggers, observability blueprint templates | P1 | More deployable and realistic designs |
| Security and compliance | Enterprise usage requires guardrails | Threat model starter, PII data-flow tagging, authN/authZ checks, audit log for design decisions | P1 | Enterprise readiness and reduced risk |
| Personalization | Generic output feels low value | User presets by domain (fintech, realtime, analytics), preferred stack profiles, saved constraints | P2 | Faster setup and better relevance |
| Ecosystem extensibility | Long-term platform growth | Plugin surface for custom analyzers, provider adapters, organization templates | P2 | Community growth and stickiness |

#### C. Priority roadmap focused on utility

##### P0: Must-have upgrades (next 4-6 weeks)

| Feature | User problem solved | Implementation notes | Success metric |
|---|---|---|---|
| Constraint-aware prompt input | Users cannot force outputs to match reality | Add prompt controls for throughput, latency target, region, budget, compliance, team size | 70% sessions use at least one constraint |
| Multi-candidate output (3 variants) | Single output is brittle and hard to trust | Generate 3 design variants: cost-optimized, balanced, reliability-first | 40% users compare variants before finalizing |
| Architecture quality checks | Users miss hidden risks | Add analyzer pass: SPOF, missing cache invalidation, missing idempotency, weak observability | 30% reduction in manual risk findings |
| One-click artifact exports | Output is hard to reuse in work tools | Export ADR draft, Mermaid, sequence flow, risk register, implementation checklist | 50% sessions trigger export |
| Regeneration controls | Users need iterative refinement | Regenerate by section: only HLD, only RCA, only solutions, only scaling | 25% lower full-regenerate requests |

##### P1: High-leverage improvements (6-12 weeks)

| Feature | User problem solved | Implementation notes | Success metric |
|---|---|---|---|
| Team review mode | Hard to review architecture asynchronously | Add shared URL mode, comment pins on nodes/edges, approve/request-changes workflow | 30% of designs reviewed by 2+ contributors |
| Version diff engine | Teams cannot quickly compare design iterations | Visual diff for nodes, edges, risks, cost, SLO assumptions | Median review time drops by 20% |
| Cost and SLO lens | Diagrams lack operational realism | Component-level monthly cost rough estimates + latency budgets + SLO targets | 60% designs include cost and SLO fields |
| Reference architecture library | Repeated prompts recreate common systems | Add curated templates: chat, payments, streaming, search, eventing | 35% sessions start from template |
| Workflow connectors | Manual copy-paste overhead | GitHub issue/PR integration, Jira ticket creation, Slack summary posting | 40% less manual transfer effort |

##### P2: Strategic differentiation (12+ weeks)

| Feature | User problem solved | Implementation notes | Success metric |
|---|---|---|---|
| Architecture simulation mode | Static diagrams hide behavior under failure | Simulate traffic spikes, region loss, dependency outage, queue backlog | 20% increase in advanced-session time |
| Policy-as-code validation | Enterprises need enforceable standards | Rule engine for org policies (approved datastores, encryption, region boundaries) | 80% policy violation detection before export |
| Organizational memory graph | Decisions get lost over time | Link design outputs to incidents, postmortems, ADR history | Faster root-cause alignment in design reviews |
| Plugin ecosystem | Teams need custom domain logic | Public plugin API for analyzers and custom node packs | Ecosystem adoption by partner teams |

#### D. Recommended information architecture upgrades

To make the app significantly more useful, add three core lenses beyond current canvas output:

1. Decision Lens: tradeoffs, assumptions, alternatives, confidence, unresolved questions
2. Delivery Lens: implementation plan, milestones, dependencies, team ownership mapping
3. Operability Lens: SLI/SLO map, runbook starters, alert strategy, failure blast-radius view

These can be implemented as additional tabs in `AnalysisPanel` and optional export sections.

#### E. Suggested data model extensions

Additive fields for `ArchitectureBlueprint` to support modern requirements:

- `assumptions: string[]`
- `alternatives: { option: string; pros: string[]; cons: string[]; whenToChoose: string }[]`
- `decisionLog: { decision: string; rationale: string; impact: "high" | "medium" | "low" }[]`
- `nonFunctionalTargets: { latencyP95Ms?: number; availabilitySLO?: string; throughputRps?: number; rto?: string; rpo?: string }`
- `costEstimate: { monthlyUsdRange: string; majorDrivers: string[]; optimizationIdeas: string[] }`
- `securityNotes: { threat: string; mitigation: string; residualRisk: string }[]`
- `operabilityPlan: { sli: string; target: string; alertHint: string }[]`
- `implementationPlan: { phase: string; tasks: string[]; risks: string[] }[]`

These fields keep the app useful across design, planning, and review workflows.

#### F. KPI framework to validate improvement impact

Track product value with measurable metrics:

| KPI | Why it matters | Target |
|---|---|---|
| Time to first useful architecture | Measures onboarding quality | <= 10s median |
| Regeneration rate per session | Proxy for output quality | <= 1.8 |
| Export rate | Measures practical utility | >= 50% |
| Share/review rate | Measures collaboration fit | >= 35% |
| Architecture acceptance score | User trust signal (1-5) | >= 4.2 |
| Return usage within 7 days | Retention and habit formation | >= 30% |

#### G. Implementation sequence with existing codebase

The most efficient sequence, based on current structure (`app/api/generate`, `hooks/useGenerateBlueprint`, `components/system-designer/*`):

1. Extend schema and prompt contracts for assumptions, alternatives, NFR targets, and cost/security notes
2. Add new `AnalysisPanel` tabs for Decision, Operability, and Delivery
3. Add multi-candidate generation and per-section regeneration controls in toolbar
4. Introduce export pipelines (ADR Markdown, Mermaid pack, checklist JSON)
5. Add review/diff model and share session metadata
6. Add connectors (GitHub, Jira, Slack) and policy validation layer

This sequence maximizes user-visible value early while preserving architecture flexibility for advanced capabilities.

---

## 2. Target Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Next.js Client)                  │
│                                                                   │
│  PromptToolbar ──► useGenerateBlueprint (hook)                   │
│                          │                                        │
│          ┌───────────────┼───────────────┐                       │
│          ▼               ▼               ▼                       │
│   ArchitectureCanvas  DetailsDrawer  AnalysisPanel              │
│   (ReactFlow HLD/LLD)  (node details) (RCA + Solutions)         │
└─────────────────────────────────────────────────────────────────┘
                          │ POST /api/generate
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Next.js API Routes (Server)                     │
│                                                                   │
│  /api/generate                                                    │
│    │                                                              │
│    ├── Rate Limiter (in-memory token bucket or upstash/redis)    │
│    │                                                              │
│    ├── Prompt Builder                                             │
│    │    ├── System prompt (role + JSON schema)                   │
│    │    └── User message (problem statement)                     │
│    │                                                              │
│    ├── LLM Client (openai / anthropic / gemini via abstraction)  │
│    │                                                              │
│    ├── JSON Validator (Zod schema)                               │
│    │                                                              │
│    └── Response Cache (in-memory Map → Redis later)             │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
            Structured ArchitectureBlueprintResponse JSON
```

### Multi-agent architecture (Phase 4+)

```
Problem Statement
      │
      ▼
 Orchestrator
      │
  ┌───┴────────────────────────────────┐
  ▼           ▼           ▼            ▼
HLD Agent   LLD Agent   RCA Agent   Solutions Agent
  │           │           │            │
  └───────────┴─────────┬─┘────────────┘
                        ▼
               Response Combiner
                        │
                        ▼
              Final Blueprint JSON
```

---

## 3. Extended Type System

The current `ArchitectureBlueprint` type needs extending. New fields are additive — existing static blueprints stay valid.

```typescript
// types/architecture.ts  (additions only — do not break existing fields)

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

// Extend ArchitectureBlueprint
export type ArchitectureBlueprint = {
  id: string;
  prompt: string;
  title: string;
  summary: string;
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  steps: AnimationStep[];

  // --- NEW FIELDS (optional so static blueprints stay valid) ---
  hldMermaid?: string;        // Mermaid graph TD string for HLD overview
  lldMermaid?: string;        // Mermaid sequenceDiagram string for LLD flow
  lldNodes?: ArchitectureNode[];  // Separate node set for LLD canvas
  lldEdges?: ArchitectureEdge[];  // Separate edge set for LLD canvas
  rootCauses?: RootCause[];
  solutions?: Solution[];
  requestFlow?: RequestFlowStep[];
  scalingNotes?: ScalingNote[];
  interviewQuestions?: string[];  // Follow-up questions for practice
};
```

---

## 4. API Design

### `POST /api/generate`

**Request**
```json
{
  "problem": "Database latency suddenly increases",
  "level": "intermediate",          // optional hint: beginner|intermediate|advanced
  "focus": ["hld", "lld", "rca"]   // optional: which sections to include
}
```

**Response (success)**
```json
{
  "blueprint": { ...ArchitectureBlueprint }
}
```

**Response (error)**
```json
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMITED",
  "retryAfterMs": 10000
}
```

**HTTP status codes**
| Code | Meaning |
|---|---|
| 200 | Blueprint generated |
| 400 | Missing / invalid problem string |
| 429 | Rate limited |
| 500 | LLM failure or JSON validation failure |
| 504 | LLM timeout |

---

## 5. Prompt Engineering

### System prompt (locked, never changed by user input)

```
You are a Principal Software Engineer and system design expert.

Given a system design problem, you will generate a complete, structured analysis.

Return ONLY a valid JSON object matching this exact schema. Do not include markdown code fences, explanations, or any text outside the JSON.

Schema:
{
  "id": "string (kebab-case slug derived from title)",
  "title": "string (concise title ≤ 60 chars)",
  "summary": "string (2-3 sentence problem summary)",
  "hldMermaid": "string (valid Mermaid graph TD diagram)",
  "lldMermaid": "string (valid Mermaid sequenceDiagram)",
  "nodes": [
    {
      "id": "string (kebab-case)",
      "label": "string",
      "sublabel": "string (technology name, optional)",
      "type": "client|edge|loadbalancer|server|cache|logic|service|observability",
      "description": "string (2-4 sentences)",
      "risks": ["string"],
      "notes": ["string"],
      "position": { "x": number, "y": number }
    }
  ],
  "edges": [
    {
      "id": "string",
      "source": "string (node id)",
      "target": "string (node id)",
      "label": "string (optional)",
      "kind": "request|shared|reject|telemetry"
    }
  ],
  "steps": [
    {
      "id": "string",
      "title": "string (step name ≤ 40 chars)",
      "description": "string (1-2 sentences explaining what happens)",
      "activeNodes": ["node-id"],
      "activeEdges": ["edge-id"]
    }
  ],
  "lldNodes": [ ...same structure as nodes ],
  "lldEdges": [ ...same structure as edges ],
  "rootCauses": [
    {
      "cause": "string",
      "probability": "high|medium|low",
      "detectionMetric": "string"
    }
  ],
  "solutions": [
    {
      "title": "string",
      "description": "string",
      "tradeoffs": "string",
      "effort": "low|medium|high"
    }
  ],
  "requestFlow": [
    {
      "from": "string",
      "to": "string",
      "protocol": "string",
      "note": "string"
    }
  ],
  "scalingNotes": [
    {
      "dimension": "horizontal|vertical|database|cache|cdn",
      "suggestion": "string"
    }
  ],
  "interviewQuestions": ["string"]
}

Layout guidelines for node positions:
- Arrange nodes left-to-right representing data flow
- x spacing: 240px between tiers
- y spacing: 160px between nodes in same tier
- Canvas origin is 0,0 at top-left

Generate a complete, production-realistic architecture. Be specific about technologies (Redis, Kafka, PostgreSQL, etc.). Include at least 6 nodes, 5 edges, and 4 animation steps.
```

### User message template

```
Problem: {{userInput}}
```

### Prompt injection prevention

- Strip all HTML tags from user input before appending to prompt
- Truncate user input to 500 characters
- Validate user input does not contain prompt injection patterns (e.g., "ignore previous instructions")
- Never concatenate raw user input directly into system prompt position

---

## 6. JSON Validation with Zod

All AI responses must be validated before reaching the frontend. Invalid responses return a 500 with a meaningful error — never a crash.

```typescript
// lib/ai/schema.ts
import { z } from "zod";

const NodeTypeSchema = z.enum([
  "client", "edge", "loadbalancer", "server",
  "cache", "logic", "service", "observability"
]);

const ArchitectureNodeSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  sublabel: z.string().optional(),
  type: NodeTypeSchema,
  description: z.string().min(1),
  risks: z.array(z.string()),
  notes: z.array(z.string()),
  position: z.object({ x: z.number(), y: z.number() }),
});

const ArchitectureEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  label: z.string().optional(),
  kind: z.enum(["request", "shared", "reject", "telemetry"]).optional(),
});

export const BlueprintSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(120),
  summary: z.string().min(1),
  hldMermaid: z.string().optional(),
  lldMermaid: z.string().optional(),
  nodes: z.array(ArchitectureNodeSchema).min(1),
  edges: z.array(ArchitectureEdgeSchema),
  steps: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    activeNodes: z.array(z.string()),
    activeEdges: z.array(z.string()),
  })),
  lldNodes: z.array(ArchitectureNodeSchema).optional(),
  lldEdges: z.array(ArchitectureEdgeSchema).optional(),
  rootCauses: z.array(z.object({
    cause: z.string(),
    probability: z.enum(["high", "medium", "low"]),
    detectionMetric: z.string(),
  })).optional(),
  solutions: z.array(z.object({
    title: z.string(),
    description: z.string(),
    tradeoffs: z.string(),
    effort: z.enum(["low", "medium", "high"]),
  })).optional(),
  requestFlow: z.array(z.object({
    from: z.string(),
    to: z.string(),
    protocol: z.string(),
    note: z.string(),
  })).optional(),
  scalingNotes: z.array(z.object({
    dimension: z.enum(["horizontal", "vertical", "database", "cache", "cdn"]),
    suggestion: z.string(),
  })).optional(),
  interviewQuestions: z.array(z.string()).optional(),
});
```

---

## 7. LLM Provider Abstraction

Support multiple providers behind a single interface so the frontend never changes when switching models.

```typescript
// lib/ai/providers/types.ts
export interface LLMProvider {
  generate(systemPrompt: string, userMessage: string): Promise<string>;
}

// lib/ai/providers/openai.ts  — uses GPT-4o with json_object response_format
// lib/ai/providers/anthropic.ts  — uses Claude 3.5 Sonnet, parses JSON from response
// lib/ai/providers/gemini.ts  — uses Gemini 1.5 Pro

// lib/ai/client.ts  — picks provider based on NEXT_PUBLIC_AI_PROVIDER env var
```

**Environment variables needed**
```env
AI_PROVIDER=openai            # openai | anthropic | gemini
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...
AI_TIMEOUT_MS=30000
AI_MAX_RETRIES=2
```

---

## 8. Storage Strategy — Where Does Data Live?

This is the most important question to answer per phase. There are three separate concerns:
1. **Server cache** — avoids re-calling the LLM for the same prompt
2. **Client state** — holds the current blueprint while the page is open
3. **Client persistence** — survives page refresh / browser close

### Storage map by phase

| Phase | Server Cache | Client State | Client Persistence |
|---|---|---|---|
| **1** | In-memory `Map` (process lifetime) | React `useState` (tab lifetime) | ❌ None — refresh loses everything |
| **2** | In-memory `Map` | React `useState` | ❌ None |
| **3** | In-memory `Map` | React `useState` | ✅ `localStorage` — up to 20 blueprints survive refresh |
| **4** | In-memory `Map` | React `useState` | ✅ `localStorage` |
| **5** | ✅ Upstash Redis — survives deploys, shared across serverless instances | React `useState` | ✅ `localStorage` |

### What "No database, no Redis" actually means in Phase 1

```
User submits prompt
        │
        ▼
Server (Next.js API Route)
  ├── in-memory Map checked  ←── lives only while the Node process is alive
  │    hit? return immediately        (dies on every Vercel cold start)
  │    miss? call OpenAI
  │
  └── validated JSON returned over HTTP
        │
        ▼
Browser
  └── React useState  ←── lives only while the browser tab is open
                              (refresh = gone)
```

**Consequence:** In Phase 1, if the user refreshes the page, the generated blueprint is lost and they must re-submit the prompt. The server cache only helps if two users (or the same user twice in one tab session) send the identical prompt before the server restarts.

This is acceptable for Phase 1 because the goal is to prove AI generation works. Persistence comes in Phase 3.

---

### Phase 1 — In-memory server cache

```typescript
// lib/ai/cache.ts
// Simple LRU Map — zero infrastructure needed
const cache = new Map<string, { blueprint: ArchitectureBlueprint; expiresAt: number }>();
const MAX_ENTRIES = 100;
const TTL_MS = 60 * 60 * 1000; // 1 hour

export function getCached(key: string) { ... }
export function setCached(key: string, blueprint: ArchitectureBlueprint) { ... }
```

- Key: `SHA-256(normalized problem string)`
- TTL: 1 hour
- Max: 100 entries (LRU eviction when full)
- **Survives:** multiple requests in same process lifetime
- **Lost when:** server restarts, Vercel cold start, new deployment

---

### Phase 3 — localStorage client persistence

```typescript
// hooks/useLocalHistory.ts
// Stores up to 20 blueprints keyed by blueprint.id slug
const STORAGE_KEY = "sd-history";
const MAX_HISTORY = 20;

export function saveToHistory(blueprint: ArchitectureBlueprint) {
  const history = loadHistory();
  const updated = [blueprint, ...history.filter(b => b.id !== blueprint.id)].slice(0, MAX_HISTORY);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}
export function loadHistory(): ArchitectureBlueprint[] { ... }
```

- **Survives:** page refresh, browser close, tab close
- **Lost when:** user clears browser data, different browser/device
- **Size:** ~50–100 KB for 20 blueprints (well within 5 MB localStorage limit)

---

### Phase 5 — Upstash Redis server cache

```typescript
// lib/ai/cache.ts  (Phase 5 swap — same interface, different implementation)
import { Redis } from "@upstash/redis";
const redis = Redis.fromEnv(); // UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN

export async function getCached(key: string) {
  return redis.get<ArchitectureBlueprint>(key);
}
export async function setCached(key: string, blueprint: ArchitectureBlueprint) {
  await redis.set(key, blueprint, { ex: 60 * 60 * 24 }); // 24-hour TTL
}
```

- **Survives:** server restarts, deployments, serverless cold starts
- **Shared across:** all serverless function instances worldwide
- **TTL:** 24 hours per unique prompt
- **Cost:** Upstash free tier — 10,000 requests/day, 256 MB storage

---

### Cache lookup flow (all phases)

```
POST /api/generate  { problem: "..." }
        │
        ▼
Normalize: lowercase + trim + collapse whitespace
        │
        ▼
Hash: SHA-256(normalized) → cache key
        │
        ▼
Cache lookup
        │
  ┌─────┴─────┐
  HIT        MISS
  │           │
  │           ▼
  │      Prompt build + LLM call + Zod validate
  │           │
  │           ▼
  │      Store in cache (TTL)
  │           │
  └─────┬─────┘
        ▼
Return { blueprint }
+ X-Cache: HIT | MISS header
```

---

## 9. Rate Limiting

Protect the AI endpoint from abuse without requiring a database.

### Phase 1: In-memory token bucket (server-side)
- Per-IP: 10 requests / minute
- Global: 100 requests / minute
- Returns `429` with `Retry-After` header

### Phase 2: Upstash Ratelimit (production)
```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
});
```

---

## 10. Frontend Changes

### `useGenerateBlueprint` hook (new)

```typescript
// hooks/useGenerateBlueprint.ts
type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; blueprint: ArchitectureBlueprint }
  | { status: "error"; message: string };

function useGenerateBlueprint() {
  const [state, setState] = useState<State>({ status: "idle" });

  const generate = useCallback(async (problem: string) => {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        setState({ status: "error", message: error });
        return;
      }
      const { blueprint } = await res.json();
      setState({ status: "success", blueprint });
    } catch {
      setState({ status: "error", message: "Network error. Try again." });
    }
  }, []);

  return { state, generate };
}
```

### `SystemDesignerShell` changes
- Import `useGenerateBlueprint`
- Replace `handleSubmitPrompt` with hook call
- Show loading skeleton over canvas while `status === "loading"`
- Show error toast when `status === "error"`
- When `status === "success"`, call `setBlueprint(blueprint)`

### New `AnalysisPanel` component (Phase 2)
- Tab bar: **Root Causes** | **Solutions** | **Request Flow** | **Scaling** | **Mermaid**
- Slides in from the right side (same pattern as `DetailsDrawer`)
- Mermaid tab: renders `blueprint.hldMermaid` and `blueprint.lldMermaid`
- Triggered by an "Analysis" button in `PromptToolbar`

### LLD canvas (Phase 2)
- When `viewMode === "LLD"` and `blueprint.lldNodes` exist, pass `lldNodes`/`lldEdges` to `ArchitectureCanvas`
- Otherwise fall back to HLD nodes (current behaviour)

---

## 11. New UI Panels

### Loading skeleton
```
┌──────────────────────────────────────────────────────┐
│  ◇ System Designer                    [HLD] [LLD]    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ Generating...  │
├──────────────────────────────────────────────────────┤
│                                                        │
│         [shimmer boxes where nodes will appear]       │
│                                                        │
└──────────────────────────────────────────────────────┘
```

### Analysis panel layout
```
┌─────────────┬─────────────────────────────┐
│             │  Root Causes  Solutions ...  │
│  Canvas     ├─────────────────────────────┤
│  (ReactFlow)│  ● Slow Queries    HIGH     │
│             │  ● Missing Index   MEDIUM   │
│             │  ● Pool Exhausted  HIGH     │
└─────────────┴─────────────────────────────┘
```

### Mermaid renderer
Install `mermaid` package, render inside an isolated `<div>` using `mermaid.render()`. Wrap in error boundary to prevent Mermaid parse errors from crashing the page.

---

## 12. Phased Roadmap

### Phase 1 — Core AI Integration (1–2 days)
**Goal:** Any prompt returns a live-generated architecture diagram.

- [ ] Install `openai` and `zod` packages
- [ ] Create `lib/ai/schema.ts` — Zod schema for blueprint
- [ ] Create `lib/ai/prompt.ts` — system prompt + user message builder + input sanitization
- [ ] Create `lib/ai/providers/openai.ts` — OpenAI GPT-4o call with `response_format: json_object`
- [ ] Create `lib/ai/client.ts` — provider factory
- [ ] Create `lib/ai/cache.ts` — in-memory LRU cache
- [ ] Create `app/api/generate/route.ts` — POST handler with rate limit + prompt + LLM + validate + cache
- [ ] Create `hooks/useGenerateBlueprint.ts` — fetch wrapper with loading/error state
- [ ] Update `types/architecture.ts` — add new optional fields
- [ ] Update `SystemDesignerShell.tsx` — wire hook, show loading overlay, show error
- [ ] Update `PromptToolbar.tsx` — show loading spinner on Generate button

**Success criteria:** Submit "database latency increases" → see a generated diagram within 15 seconds.

---

### Phase 2 — Rich Output (2–3 days)
**Goal:** Show root causes, solutions, Mermaid diagrams, and LLD.

- [ ] Install `mermaid` package
- [ ] Create `components/system-designer/MermaidDiagram.tsx` — isolated mermaid renderer with error boundary
- [ ] Create `components/system-designer/AnalysisPanel.tsx` — tabbed panel: Root Causes, Solutions, Request Flow, Scaling, Mermaid
- [ ] Update `DetailsDrawer.tsx` — add Mermaid tab if `hldMermaid` present
- [ ] Update `SystemDesignerShell.tsx` — add Analysis panel toggle button and layout
- [ ] Update `ArchitectureCanvas.tsx` — switch to `lldNodes`/`lldEdges` when `viewMode === "LLD"` and data exists
- [ ] Update prompt to request richer output (lldNodes, rootCauses, solutions, scalingNotes)
- [ ] Add `interviewQuestions` display in AnalysisPanel

**Success criteria:** Clicking "Analysis" opens panel showing root causes with probability badges and actionable solutions.

---

### Phase 3 — History & Persistence (1–2 days)
**Goal:** Users can revisit previous analyses.

- [ ] Use `localStorage` to persist up to 20 recent blueprints (keyed by slug)
- [ ] Add a "Recent" dropdown in `PromptToolbar`
- [ ] Add "Export JSON" button (download `blueprint.json`)
- [ ] Add "Share" button (copy URL with `?prompt=encoded-problem` that auto-generates on load)
- [ ] URL state: sync `prompt` query param with current blueprint

**Success criteria:** Refresh the page → previous diagram reloads. Copy URL → paste in new tab → same diagram generates.

---

### Phase 4 — Multi-Agent Orchestration (3–5 days)
**Goal:** Higher quality output by splitting concerns across agents.

Instead of one large prompt, use sequential (or parallel) specialized agents:

```
Orchestrator (app/api/generate/route.ts)
   │
   ├── HLD Agent: generates nodes, edges, steps (graph structure)
   ├── LLD Agent: generates lldNodes, lldEdges, sequenceDiagram
   ├── RCA Agent: generates rootCauses, detectionMetrics
   └── Solutions Agent: generates solutions, scalingNotes, interviewQuestions
```

Each agent gets:
- The original problem
- Outputs from previous agents (so Solutions Agent knows the RCA)

Implementation options:
1. **Sequential calls** — simple, predictable cost, ~4× LLM calls (40–60s)
2. **Parallel calls** — HLD + RCA + Solutions in parallel, LLD after HLD (25–30s)
3. **Vercel AI SDK** `streamText` with tool calls — streaming updates to UI as each agent completes

Recommended: Start with parallel calls (option 2).

- [ ] Refactor `lib/ai/client.ts` into `lib/ai/orchestrator.ts`
- [ ] Create separate agent prompt files: `hld-agent.ts`, `lld-agent.ts`, `rca-agent.ts`, `solutions-agent.ts`
- [ ] Add `Promise.allSettled` for parallel HLD + RCA + Solutions
- [ ] Combine results in `combineAgentOutputs()` function
- [ ] Add streaming endpoint `/api/generate/stream` for progressive rendering
- [ ] Update UI to show "Generating HLD... Generating Analysis..." progress

**Success criteria:** Canvas populates with HLD within 8 seconds. Analysis panel fills in as other agents complete.

---

### Phase 5 — Production Readiness (2–3 days)
**Goal:** Safe, reliable, observable deployment.

- [ ] Replace in-memory cache with Upstash Redis
- [ ] Replace in-memory rate limiter with Upstash Ratelimit
- [ ] Add `NEXT_PUBLIC_AI_PROVIDER` env for multi-provider support
- [ ] Add Anthropic and Gemini provider implementations
- [ ] Add request logging (prompt hash, latency, token usage, provider)
- [ ] Add Sentry / error tracking
- [ ] Add OpenTelemetry traces for the generate pipeline
- [ ] Add cost tracking: log estimated token cost per request
- [ ] Add health endpoint `GET /api/health` → `{ status: "ok", cache: "hit_rate", ratelimit: "...", provider: "..." }`
- [ ] Input sanitization audit (OWASP prompt injection patterns)
- [ ] API key rotation support via environment variables

**Success criteria:** App runs on Vercel with Redis cache, <$0.05 per unique prompt, rate limited to 10 req/min per IP.

---

## 13. File Structure After Full Implementation

```
system-design-app/
│
├── app/                                         ← Next.js App Router root
│   │
│   ├── api/                                     ← BACKEND: all server-side API routes
│   │   │
│   │   ├── generate/
│   │   │   └── route.ts                         ← POST /api/generate
│   │   │                                           Orchestrates: rate-limit → cache check
│   │   │                                           → prompt build → LLM call → Zod validate
│   │   │                                           → cache store → return JSON
│   │   │
│   │   ├── generate/stream/
│   │   │   └── route.ts                         ← POST /api/generate/stream  (Phase 4)
│   │   │                                           Server-Sent Events endpoint; emits
│   │   │                                           partial blueprint as each agent finishes
│   │   │
│   │   └── health/
│   │       └── route.ts                         ← GET /api/health
│   │                                               Returns provider, cache hit-rate, uptime
│   │
│   ├── globals.css                              ← Tailwind base styles
│   ├── layout.tsx                               ← Root layout + fonts + metadata
│   └── page.tsx                                 ← Renders SystemDesignerShell
│
│
├── components/                                  ← FRONTEND: all React UI components
│   └── system-designer/
│       │
│       ├── AnalysisPanel.tsx                    ← NEW (Phase 2)
│       │                                           Tabbed right-side panel
│       │                                           Tabs: Root Causes | Solutions |
│       │                                                 Request Flow | Scaling | Mermaid
│       │
│       ├── ArchitectureCanvas.tsx               ← MODIFIED (Phase 2)
│       │                                           Accepts lldNodes/lldEdges when
│       │                                           viewMode === "LLD" and data exists
│       │
│       ├── DetailsDrawer.tsx                    ← MODIFIED (Phase 2)
│       │                                           Richer node detail, implementation notes
│       │
│       ├── LoadingOverlay.tsx                   ← NEW (Phase 1)
│       │                                           Shimmer skeleton over canvas
│       │                                           while AI is generating
│       │
│       ├── MermaidDiagram.tsx                   ← NEW (Phase 2)
│       │                                           Client-only Mermaid renderer
│       │                                           Wrapped in React error boundary
│       │
│       ├── PromptToolbar.tsx                    ← MODIFIED (Phase 1)
│       │                                           Loading spinner on Generate button,
│       │                                           disabled state during fetch
│       │
│       ├── SystemDesignerShell.tsx              ← MODIFIED (Phase 1 + 2)
│       │                                           Wires useGenerateBlueprint hook,
│       │                                           handles loading/error/success states,
│       │                                           manages AnalysisPanel open state
│       │
│       ├── SystemNode.tsx                       ← unchanged
│       └── TimelineBar.tsx                      ← unchanged
│
│
├── hooks/                                       ← FRONTEND: React custom hooks
│   ├── useGenerateBlueprint.ts                  ← NEW (Phase 1)
│   │                                               fetch wrapper, manages state machine:
│   │                                               idle → loading → success | error
│   │
│   └── useLocalHistory.ts                       ← NEW (Phase 3)
│                                                   Read/write up to 20 blueprints
│                                                   in localStorage, keyed by slug
│
│
├── lib/                                         ← SHARED: server + shared utilities
│   │
│   ├── ai/                                      ← AI MIDDLEWARE LAYER (server-only)
│   │   │
│   │   ├── providers/                           ← LLM provider implementations
│   │   │   ├── types.ts                         ← NEW: LLMProvider interface
│   │   │   │                                       generate(system, user): Promise<string>
│   │   │   │
│   │   │   ├── openai.ts                        ← NEW (Phase 1)
│   │   │   │                                       GPT-4o, response_format: json_object
│   │   │   │                                       Handles timeout + retries
│   │   │   │
│   │   │   ├── anthropic.ts                     ← NEW (Phase 5)
│   │   │   │                                       Claude 3.5 Sonnet
│   │   │   │                                       Extracts JSON from prose response
│   │   │   │
│   │   │   └── gemini.ts                        ← NEW (Phase 5)
│   │   │                                           Gemini 1.5 Pro
│   │   │                                           responseMimeType: application/json
│   │   │
│   │   ├── agents/                              ← MULTI-AGENT LAYER (Phase 4)
│   │   │   ├── hld-agent.ts                     ← Generates nodes, edges, steps
│   │   │   ├── lld-agent.ts                     ← Generates lldNodes, lldEdges, sequenceDiagram
│   │   │   ├── rca-agent.ts                     ← Generates rootCauses + detectionMetrics
│   │   │   └── solutions-agent.ts               ← Generates solutions, scalingNotes,
│   │   │                                            interviewQuestions
│   │   │
│   │   ├── cache.ts                             ← NEW (Phase 1)
│   │   │                                           Phase 1: in-memory LRU Map (100 entries)
│   │   │                                           Phase 5: swap to Upstash Redis
│   │   │                                           Interface: get(key) / set(key, value, ttl)
│   │   │
│   │   ├── client.ts                            ← NEW (Phase 1)
│   │   │                                           Provider factory — reads AI_PROVIDER env,
│   │   │                                           returns correct LLMProvider instance
│   │   │
│   │   ├── orchestrator.ts                      ← NEW (Phase 4)
│   │   │                                           Runs HLD + RCA + Solutions in parallel,
│   │   │                                           awaits HLD then runs LLD agent,
│   │   │                                           combines via combineAgentOutputs()
│   │   │
│   │   ├── prompt.ts                            ← NEW (Phase 1)
│   │   │                                           buildSystemPrompt(): full JSON-schema prompt
│   │   │                                           buildUserMessage(input): sanitized user msg
│   │   │                                           detectCategory(input): keyword → category hint
│   │   │                                           sanitizeInput(raw): strip HTML, truncate 500ch,
│   │   │                                             reject injection patterns
│   │   │
│   │   ├── rate-limit.ts                        ← NEW (Phase 1)
│   │   │                                           Phase 1: in-memory token bucket per IP
│   │   │                                           Phase 5: swap to Upstash Ratelimit
│   │   │                                           check(ip): { allowed, retryAfterMs }
│   │   │
│   │   └── schema.ts                            ← NEW (Phase 1)
│   │                                               Zod schema for full BlueprintSchema
│   │                                               Validates every AI response before
│   │                                               it reaches the frontend
│   │
│   └── system-data/                             ← Static demo blueprints (kept as fallback)
│       ├── index.ts                             ← exports defaultBlueprint + blueprints map
│       └── rate-limiter.ts                      ← Hardcoded rate-limiter demo blueprint
│
│
├── types/                                       ← SHARED TypeScript types (client + server)
│   └── architecture.ts                          ← MODIFIED (Phase 1)
│                                                   Extended with optional fields:
│                                                   hldMermaid, lldMermaid, lldNodes,
│                                                   lldEdges, rootCauses, solutions,
│                                                   requestFlow, scalingNotes,
│                                                   interviewQuestions
│
│
├── .env.local                                   ← Secret keys (gitignored)
│                                                   AI_PROVIDER, OPENAI_API_KEY,
│                                                   ANTHROPIC_API_KEY, GEMINI_API_KEY,
│                                                   AI_TIMEOUT_MS, AI_MAX_RETRIES
│
├── .env.example                                 ← Committed template (no real keys)
├── ARCHITECTURE_PLAN.md                         ← This document
├── next.config.ts
├── package.json                                 ← MODIFIED: openai, zod, mermaid added
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

### Layer responsibilities at a glance

```
┌─────────────────────────────────────────────────────────────────────┐
│  FRONTEND  (app/ + components/ + hooks/)                            │
│                                                                       │
│  page.tsx                                                            │
│    └── SystemDesignerShell          ← state owner, layout           │
│          ├── PromptToolbar          ← user input + loading state     │
│          ├── ArchitectureCanvas     ← ReactFlow HLD or LLD graph     │
│          ├── TimelineBar            ← step playback controls         │
│          ├── DetailsDrawer          ← node detail side panel         │
│          ├── AnalysisPanel          ← RCA / Solutions / Mermaid      │
│          └── LoadingOverlay         ← canvas shimmer during fetch    │
│                                                                       │
│  hooks/useGenerateBlueprint         ← fetch + state machine         │
│  hooks/useLocalHistory              ← localStorage persistence       │
└──────────────────────────┬──────────────────────────────────────────┘
                           │  POST /api/generate
                           │  (JSON over HTTPS)
┌──────────────────────────▼──────────────────────────────────────────┐
│  BACKEND  (app/api/)                                                 │
│                                                                       │
│  route.ts                                                            │
│    ├── lib/ai/rate-limit.ts         ← reject before LLM cost        │
│    ├── lib/ai/cache.ts              ← short-circuit on cache hit     │
│    ├── lib/ai/prompt.ts             ← build + sanitize messages      │
│    ├── lib/ai/client.ts             ← pick provider                  │
│    │     └── lib/ai/providers/      ← openai / anthropic / gemini    │
│    ├── lib/ai/orchestrator.ts       ← multi-agent fan-out (Phase 4)  │
│    └── lib/ai/schema.ts             ← Zod validate before returning  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 14. New Dependencies

| Package | Purpose | Phase |
|---|---|---|
| `openai` | GPT-4o API client | 1 |
| `zod` | Runtime JSON schema validation | 1 |
| `mermaid` | Render Mermaid diagram strings | 2 |
| `@upstash/redis` | Serverless Redis cache | 5 |
| `@upstash/ratelimit` | Sliding window rate limiting | 5 |
| `@anthropic-ai/sdk` | Claude provider | 5 |
| `@google/generative-ai` | Gemini provider | 5 |

---

## 15. Security Checklist

- [x] AI keys only in server-side environment variables (never `NEXT_PUBLIC_`)
- [ ] Strip HTML and injection patterns from user input before passing to prompt
- [ ] Truncate user input to 500 characters server-side
- [ ] Validate Content-Type header on `/api/generate` (reject non-JSON)
- [ ] Rate limit per IP using `x-forwarded-for` header (with proxy trust validation)
- [ ] Never return raw LLM error messages to the client (log server-side, return generic message)
- [ ] CORS: restrict `/api/generate` to same-origin in production
- [ ] Set `Referrer-Policy`, `X-Content-Type-Options`, `X-Frame-Options` headers
- [ ] Log all requests (sanitised — no prompt content, just hash + metadata)
- [ ] Dependency audit: `npm audit` as part of CI

---

## 16. Key Design Decisions and Rationale

### Why Next.js API Routes instead of a separate backend?
The app is already on Next.js. API Routes run on the same serverless infrastructure, share TypeScript types, and require zero additional deployment. A separate Node/Spring backend adds operational complexity with no benefit at this scale. **Migrate to a separate service only when the AI pipeline needs > 30s execution time** (Lambda limit) or when team ownership separates.

### Why OpenAI `response_format: { type: "json_object" }` first?
It is the most reliable way to guarantee parseable JSON output without custom post-processing. Claude and Gemini require wrapping/extracting JSON from prose, adding fragility. Switching providers is cheap because the abstraction layer is in place from Phase 1.

### Why Zod instead of manual validation?
Zod gives compile-time TypeScript inference + runtime validation in one schema. If the AI returns a node without a required field, Zod catches it, the API returns 500, and the frontend shows an error instead of crashing.

### Why in-memory cache before Redis?
Redis requires a paid service (Upstash free tier is limited) and adds a network hop. In-memory handles the development + demo case perfectly. The cache interface is identical, so replacing it with Redis in Phase 5 is a one-line change.

### Why not a vector database for question matching?
The question set (100 questions in `System_Design_Scenario_Question.md`) is small enough to pass as context directly. Vector search adds infrastructure cost and complexity that buys nothing at this size. **Re-evaluate when the question library exceeds 10,000 entries or when semantic similarity search is needed for autocomplete.**

### Why keep static `rateLimiterBlueprint`?
It serves as the fallback/demo blueprint when the API key is not set, when the app loads for the first time, and for local development without an API key. It also acts as a reference for what valid blueprint JSON looks like.

---

## 17. Interview Question Category Routing

The `System_Design_Scenario_Question.md` file has 90 questions across 9 categories. The prompt should route the category to the AI to produce more targeted output.

| Category | Focus for AI |
|---|---|
| Level 1–2 (Beginner/Intermediate) | Web-tier scaling, caching, databases |
| Level 3 (Distributed Systems) | Consensus, sharding, distributed coordination |
| Level 4 (Cloud & Kubernetes) | Container orchestration, multi-region |
| Level 5 (Event-Driven) | Kafka, event sourcing, stream processing |
| Level 6 (Observability) | Metrics, tracing, alerting pipelines |
| Level 7 (AI Systems) | RAG, vector search, LLM serving |
| Level 8 (Staff/Architect) | Multi-region, multi-tenant, petabyte scale |
| Production Incidents | Runbooks, incident timelines, mitigation |
| Trade-offs | Comparison tables, decision matrices |

The prompt builder detects the category by keyword matching and appends a category hint:
```
Category hint: This is an event-driven systems problem. Focus on Kafka, consumer groups, partition strategy, and exactly-once delivery.
```

---

## 18. Start Here (Phase 1 Quick Start)

To get AI generation working with minimal changes:

```bash
# 1. Install dependencies
npm install openai zod

# 2. Create .env.local
echo "AI_PROVIDER=openai" >> .env.local
echo "OPENAI_API_KEY=sk-..." >> .env.local

# 3. Create the files in this order:
#    types/architecture.ts       ← add new optional fields
#    lib/ai/schema.ts            ← Zod schema
#    lib/ai/prompt.ts            ← system prompt + sanitizer
#    lib/ai/providers/openai.ts  ← LLM call
#    lib/ai/client.ts            ← provider factory
#    lib/ai/cache.ts             ← LRU map
#    app/api/generate/route.ts   ← API handler
#    hooks/useGenerateBlueprint.ts ← client hook
#    components/.../PromptToolbar.tsx ← add loading state
#    components/.../SystemDesignerShell.tsx ← wire hook

# 4. Test
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"problem":"database latency suddenly increases"}'
```

The entire Phase 1 is approximately **8 new files and 2 modified files**. No database. No Redis. Just an API key and structured prompting.
