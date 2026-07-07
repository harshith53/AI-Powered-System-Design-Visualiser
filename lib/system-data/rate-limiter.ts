import type { ArchitectureBlueprint } from "@/types/architecture";

export const rateLimiterBlueprint: ArchitectureBlueprint = {
  id: "distributed-rate-limiter",
  prompt: "How does distributed rate limiting work in production?",
  title: "Distributed Rate Limiter",
  summary:
    "Token-bucket rate limiting across a horizontally scaled API tier, coordinated through Redis with atomic Lua execution.",
  nodes: [
    {
      id: "client",
      label: "Client",
      sublabel: "Browser / Mobile",
      type: "client",
      description:
        "End-user device issuing HTTP requests. Identified by API key, user id, or IP for rate-limit bucketing.",
      risks: [
        "Spoofed identifiers can bypass per-user buckets",
        "Retry storms on 429 responses amplify load",
      ],
      notes: [
        "Always include a stable identity header (API key, signed user id)",
        "Honor Retry-After and X-RateLimit-Reset on 429",
      ],
      position: { x: 0, y: 240 },
    },
    {
      id: "lb",
      label: "Load Balancer",
      sublabel: "L7 / Envoy",
      type: "loadbalancer",
      description:
        "Routes incoming requests to a healthy API server using consistent hashing or least-connections.",
      risks: [
        "Hot shard if hashing key has low cardinality",
        "Health-check flapping causes uneven load",
      ],
      notes: [
        "Terminate TLS here, forward to API tier over mTLS",
        "Emit per-route latency + 5xx metrics",
      ],
      position: { x: 240, y: 240 },
    },
    {
      id: "api-1",
      label: "API Server 1",
      sublabel: "stateless",
      type: "server",
      description:
        "Stateless application server. Computes the rate-limit key and delegates the atomic decision to Redis via Lua.",
      risks: [
        "Local in-memory counters drift between replicas",
        "Slow Redis call blocks request thread",
      ],
      notes: [
        "Set a tight Redis client timeout (~50ms)",
        "Fail open or closed by policy when Redis unavailable",
      ],
      position: { x: 520, y: 80 },
    },
    {
      id: "api-2",
      label: "API Server 2",
      sublabel: "stateless",
      type: "server",
      description:
        "Stateless replica. Identical code path to API Server 1; horizontal scaling unit.",
      risks: ["Cold-start latency on new pods", "Config drift across replicas"],
      notes: ["Roll out via canary", "Pin Lua script SHA at deploy time"],
      position: { x: 520, y: 240 },
    },
    {
      id: "api-3",
      label: "API Server 3",
      sublabel: "stateless",
      type: "server",
      description:
        "Stateless replica. Shared rate-limit state in Redis ensures global correctness.",
      risks: ["Hot key contention for popular tenants"],
      notes: ["Shard hot tenants across multiple Redis keys"],
      position: { x: 520, y: 400 },
    },
    {
      id: "redis",
      label: "Redis",
      sublabel: "shared state",
      type: "cache",
      description:
        "Centralized in-memory store holding token buckets keyed by tenant. Single source of truth across API replicas.",
      risks: [
        "Single-node Redis = single point of failure",
        "Network partition splits counters",
      ],
      notes: [
        "Run Redis Cluster with at least one replica per shard",
        "Use TTLs equal to the longest window to bound memory",
      ],
      position: { x: 820, y: 240 },
    },
    {
      id: "lua",
      label: "Lua Atomic Check",
      sublabel: "EVALSHA",
      type: "logic",
      description:
        "Server-side Lua script that atomically reads the bucket, decrements tokens, and returns allow/deny. Eliminates check-then-act races.",
      risks: [
        "Long-running script blocks Redis event loop",
        "Script SHA mismatch between deploys",
      ],
      notes: [
        "Keep Lua under a few microseconds per call",
        "Preload script with SCRIPT LOAD on boot",
      ],
      position: { x: 1080, y: 240 },
    },
    {
      id: "backend",
      label: "Backend Service",
      sublabel: "downstream",
      type: "service",
      description:
        "The protected service. Only sees traffic that passed the rate limit, allowing it to scale based on real demand.",
      risks: [
        "Still must defend against bursts inside the budget",
        "Coupling to limiter SLO",
      ],
      notes: [
        "Apply per-endpoint quotas at the limiter, not here",
        "Add circuit breakers downstream",
      ],
      position: { x: 1360, y: 160 },
    },
    {
      id: "monitoring",
      label: "Monitoring",
      sublabel: "Prometheus / Grafana",
      type: "observability",
      description:
        "Collects allow/deny counters, p99 limiter latency, Redis hit/miss, and per-tenant top-N traffic.",
      risks: ["Blind to silent fail-open events without explicit metric"],
      notes: [
        "Alert on deny-rate spike + allow-rate drop together",
        "Track Redis CPU and slowlog as leading indicators",
      ],
      position: { x: 1360, y: 400 },
    },
  ],
  edges: [
    { id: "e-client-lb", source: "client", target: "lb", kind: "request", label: "HTTPS" },
    { id: "e-lb-api1", source: "lb", target: "api-1", kind: "request" },
    { id: "e-lb-api2", source: "lb", target: "api-2", kind: "request" },
    { id: "e-lb-api3", source: "lb", target: "api-3", kind: "request" },
    { id: "e-api1-redis", source: "api-1", target: "redis", kind: "shared", label: "EVALSHA" },
    { id: "e-api2-redis", source: "api-2", target: "redis", kind: "shared", label: "EVALSHA" },
    { id: "e-api3-redis", source: "api-3", target: "redis", kind: "shared", label: "EVALSHA" },
    { id: "e-redis-lua", source: "redis", target: "lua", kind: "shared", label: "atomic" },
    { id: "e-lua-redis", source: "lua", target: "redis", kind: "shared", label: "decision" },
    { id: "e-api2-backend", source: "api-2", target: "backend", kind: "request", label: "allow" },
    { id: "e-api1-backend", source: "api-1", target: "backend", kind: "reject", label: "deny → 429" },
    { id: "e-api3-monitoring", source: "api-3", target: "monitoring", kind: "telemetry" },
    { id: "e-backend-monitoring", source: "backend", target: "monitoring", kind: "telemetry" },
    { id: "e-redis-monitoring", source: "redis", target: "monitoring", kind: "telemetry" },
  ],
  steps: [
    {
      id: "s1",
      title: "Request arrives",
      description:
        "Client issues a request with its identity header. Load balancer terminates TLS and forwards.",
      activeNodes: ["client", "lb"],
      activeEdges: ["e-client-lb"],
    },
    {
      id: "s2",
      title: "LB selects API server",
      description:
        "Load balancer picks an API replica via consistent hashing on the rate-limit key.",
      activeNodes: ["lb", "api-2"],
      activeEdges: ["e-lb-api2"],
    },
    {
      id: "s3",
      title: "Redis lookup",
      description:
        "API server computes the bucket key and issues EVALSHA against Redis with the bucket id and cost.",
      activeNodes: ["api-2", "redis"],
      activeEdges: ["e-api2-redis"],
    },
    {
      id: "s4",
      title: "Lua atomic increment",
      description:
        "Lua script reads tokens, deducts cost, writes new state, and returns allow/deny — all atomically.",
      activeNodes: ["redis", "lua"],
      activeEdges: ["e-redis-lua", "e-lua-redis"],
    },
    {
      id: "s5",
      title: "Allow → backend",
      description:
        "Tokens available. API forwards the request to the backend service. Telemetry emitted.",
      activeNodes: ["api-2", "backend", "monitoring"],
      activeEdges: ["e-api2-backend", "e-backend-monitoring"],
    },
    {
      id: "s6",
      title: "Reject → 429",
      description:
        "Bucket empty. API short-circuits with 429 and Retry-After. Deny counter incremented.",
      activeNodes: ["api-1", "monitoring"],
      activeEdges: ["e-api1-backend", "e-redis-monitoring"],
    },
  ],
};
