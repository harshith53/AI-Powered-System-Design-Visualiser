// ─── Injection patterns that should never reach the LLM ──────────────────────
const INJECTION_PATTERNS = [
  /ignore\s+(previous|above|all)\s+instructions/i,
  /disregard\s+(previous|above|all)\s+instructions/i,
  /forget\s+(previous|above|all)\s+instructions/i,
  /you\s+are\s+now\s+/i,
  /act\s+as\s+(if|a|an)\s+/i,
  /new\s+persona/i,
  /system\s+prompt/i,
  /\bDAN\b/,
  /jailbreak/i,
];

const MAX_INPUT_LENGTH = 500;

// Strip HTML tags and sanitize user input
function sanitizeInput(raw: string): string {
  // Remove HTML tags
  const stripped = raw.replace(/<[^>]*>/g, "");
  // Collapse whitespace
  const normalized = stripped.replace(/\s+/g, " ").trim();
  // Truncate
  return normalized.slice(0, MAX_INPUT_LENGTH);
}

function hasInjectionAttempt(input: string): boolean {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(input));
}

export function buildUserMessage(raw: string): { message: string; error?: string } {
  const sanitized = sanitizeInput(raw);

  if (!sanitized) {
    return { message: "", error: "Problem description cannot be empty" };
  }

  if (hasInjectionAttempt(sanitized)) {
    return { message: "", error: "Invalid input detected" };
  }

  return { message: `Problem: ${sanitized}` };
}

// ─── Category detection for richer prompts ───────────────────────────────────
const CATEGORY_HINTS: Array<{ keywords: RegExp; hint: string }> = [
  {
    keywords: /kafka|event.driven|consumer|producer|stream|message queue|pub.sub/i,
    hint: "This is an event-driven systems problem. Focus on Kafka, consumer groups, partition strategy, offset management, and exactly-once delivery semantics.",
  },
  {
    keywords: /kubernetes|k8s|pod|deployment|node|cluster|container|helm|ingress/i,
    hint: "This is a Kubernetes/Cloud infrastructure problem. Focus on scheduler, resource limits, horizontal pod autoscaling, node affinity, and multi-region failover.",
  },
  {
    keywords: /observability|monitoring|tracing|metrics|logging|alerting|grafana|prometheus/i,
    hint: "This is an observability problem. Focus on the metrics-traces-logs triad, cardinality management, alert fatigue reduction, and distributed tracing across services.",
  },
  {
    keywords: /llm|rag|vector|embedding|ai agent|chatbot|inference|model serving/i,
    hint: "This is an AI systems problem. Focus on RAG pipeline design, vector database selection, LLM inference latency, context window management, and cost optimization.",
  },
  {
    keywords: /shard|partition|billion|petabyte|multi.region|global|distributed lock/i,
    hint: "This is a large-scale distributed systems problem. Focus on sharding strategy, consensus algorithms, conflict-free replicated data types (CRDTs), and multi-region consistency trade-offs.",
  },
  {
    keywords: /database.*latenc|slow quer|index|connection pool|replica|read.replica/i,
    hint: "This is a database performance problem. Focus on query optimization, indexing strategy, connection pooling, read replicas, caching layers, and observability metrics.",
  },
  {
    keywords: /incident|down|outage|latency|spike|crash|memory leak|cpu/i,
    hint: "This is a production incident scenario. Structure the response as: immediate detection → triage → mitigation → root cause → prevention. Include runbook steps.",
  },
];

function detectCategoryHint(input: string): string {
  for (const { keywords, hint } of CATEGORY_HINTS) {
    if (keywords.test(input)) return hint;
  }
  return "";
}

// ─── System prompt ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a Principal Software Engineer and system design expert with 15+ years of production experience.

Given a system design problem, generate a complete, structured architecture analysis.

Return ONLY a valid JSON object matching this exact schema. No markdown fences, no explanations, no text outside the JSON.

{
  "id": "kebab-case-slug",
  "title": "Concise title (max 60 chars)",
  "summary": "2-3 sentences describing the problem and solution approach",
  "hldMermaid": "graph TD\\n  A[Client] --> B[Load Balancer]\\n  ...",
  "lldMermaid": "sequenceDiagram\\n  Client->>API: Request\\n  ...",
  "nodes": [
    {
      "id": "kebab-case-id",
      "label": "Component Name",
      "sublabel": "Technology (e.g. Redis, Kafka)",
      "type": "client|edge|loadbalancer|server|cache|logic|service|observability",
      "description": "2-4 sentences on purpose and behaviour",
      "risks": ["risk 1", "risk 2"],
      "notes": ["operational note 1", "note 2"],
      "position": { "x": 0, "y": 0 }
    }
  ],
  "edges": [
    {
      "id": "e-source-target",
      "source": "node-id",
      "target": "node-id",
      "label": "optional label",
      "kind": "request|shared|reject|telemetry"
    }
  ],
  "steps": [
    {
      "id": "s1",
      "title": "Step name (max 40 chars)",
      "description": "1-2 sentences on what happens in this step",
      "activeNodes": ["node-id"],
      "activeEdges": ["edge-id"]
    }
  ],
  "lldNodes": [ "same structure as nodes, focused on internal service components" ],
  "lldEdges": [ "same structure as edges" ],
  "rootCauses": [
    { "cause": "Root cause description", "probability": "high|medium|low", "detectionMetric": "metric to detect this" }
  ],
  "solutions": [
    { "title": "Solution name", "description": "How it solves the problem", "tradeoffs": "What you give up", "effort": "low|medium|high" }
  ],
  "requestFlow": [
    { "from": "Component A", "to": "Component B", "protocol": "HTTP/gRPC/TCP", "note": "context" }
  ],
  "scalingNotes": [
    { "dimension": "horizontal|vertical|database|cache|cdn", "suggestion": "specific scaling advice" }
  ],
  "interviewQuestions": ["Follow-up question 1?", "Follow-up question 2?"]
}

Node position layout rules:
- Arrange left-to-right following data flow direction
- x spacing: 240px between tiers, y spacing: 160px between nodes in the same tier
- Canvas origin: { x: 0, y: 0 } top-left

Quality requirements:
- Name specific technologies (PostgreSQL, Redis Cluster, Kafka, Envoy, Prometheus)
- Include at least 6 HLD nodes, 5 edges, 4 animation steps
- rootCauses must include detection metrics (e.g. "p99 query latency > 500ms")
- solutions must include realistic tradeoffs
- lldNodes should show internal sub-components of the most complex service`;

export function buildSystemPrompt(categoryHint: string): string {
  if (!categoryHint) return SYSTEM_PROMPT;
  return `${SYSTEM_PROMPT}\n\nCategory hint: ${categoryHint}`;
}

export function buildPrompt(raw: string): {
  systemPrompt: string;
  userMessage: string;
  error?: string;
} {
  const { message, error } = buildUserMessage(raw);
  if (error) return { systemPrompt: "", userMessage: "", error };

  const hint = detectCategoryHint(raw);
  return {
    systemPrompt: buildSystemPrompt(hint),
    userMessage: message,
  };
}
