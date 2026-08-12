"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

type ScenarioNode = {
  id: string;
  label: string;
  x: number;
  y: number;
};

type ScenarioEdge = {
  id: string;
  source: string;
  target: string;
  label: string;
};

type Scenario = {
  id: string;
  title: string;
  vibe: string;
  confidence: number;
  question: string;
  snapshot: string[];
  insight: string;
  kpis: string[];
  nodes: ScenarioNode[];
  edges: ScenarioEdge[];
  activeNodes: string[];
  activeEdges: string[];
};

const SCENARIOS: Scenario[] = [
  {
    id: "food-delivery",
    title: "Food Delivery",
    vibe: "Latency + failover critical",
    confidence: 94,
    question:
      "Design a global food-delivery platform for 15M DAU with real-time tracking, 99.99% checkout uptime, and city-level failover.",
    snapshot: [
      "Geo-DNS + regional API gateways route traffic to nearest healthy region.",
      "Order service is idempotent and event-driven for assignment and ETA updates.",
      "Redis hot paths + region-sharded Postgres keep p95 under 180ms.",
      "Active-active disaster recovery with fallback ETA model for degraded mode.",
    ],
    insight:
      "This graph prioritizes low-latency ordering and resilient city failover under burst traffic.",
    kpis: ["p95 < 180ms", "99.99% checkout", "City-level failover"],
    nodes: [
      { id: "fd-gateway", label: "Geo DNS + API GW", x: 0, y: 70 },
      { id: "fd-order", label: "Order Service", x: 210, y: 70 },
      { id: "fd-events", label: "Kafka Events", x: 420, y: 70 },
      { id: "fd-dispatch", label: "Dispatch Engine", x: 420, y: 185 },
      { id: "fd-eta", label: "Tracking + ETA", x: 620, y: 185 },
      { id: "fd-cache", label: "Redis", x: 210, y: 205 },
      { id: "fd-db", label: "Sharded Postgres", x: 20, y: 205 },
      { id: "fd-dr", label: "Active-Active DR", x: 620, y: 70 },
    ],
    edges: [
      { id: "fd-e1", source: "fd-gateway", target: "fd-order", label: "secure request" },
      { id: "fd-e2", source: "fd-order", target: "fd-events", label: "publish order" },
      { id: "fd-e3", source: "fd-events", target: "fd-dispatch", label: "dispatch event" },
      { id: "fd-e4", source: "fd-dispatch", target: "fd-eta", label: "eta updates" },
      { id: "fd-e5", source: "fd-order", target: "fd-cache", label: "hot reads" },
      { id: "fd-e6", source: "fd-order", target: "fd-db", label: "durable write" },
      { id: "fd-e7", source: "fd-order", target: "fd-dr", label: "replicate" },
    ],
    activeNodes: ["fd-gateway", "fd-order", "fd-events", "fd-dispatch", "fd-eta", "fd-cache", "fd-db", "fd-dr"],
    activeEdges: ["fd-e1", "fd-e2", "fd-e3", "fd-e4", "fd-e5", "fd-e6", "fd-e7"],
  },
  {
    id: "video-streaming",
    title: "Video Streaming",
    vibe: "Throughput + playback quality",
    confidence: 92,
    question:
      "Design a global video streaming system supporting 8M concurrent viewers, adaptive bitrate playback, and release-day spikes.",
    snapshot: [
      "Edge CDN serves segments close to users, offloading origin traffic.",
      "Ingest and transcoding pipeline produces multi-bitrate HLS/DASH assets.",
      "Metadata + recommendation services personalize home feeds in near real time.",
      "Observability pipeline monitors rebuffer rate, startup delay, and regional QoE.",
    ],
    insight:
      "This graph emphasizes content delivery efficiency and playback quality at scale.",
    kpis: ["8M concurrent", "ABR playback", "release spike ready"],
    nodes: [
      { id: "vs-client", label: "Playback Client", x: 0, y: 120 },
      { id: "vs-cdn", label: "Global CDN", x: 190, y: 120 },
      { id: "vs-origin", label: "Origin + Packager", x: 400, y: 60 },
      { id: "vs-transcode", label: "Transcoding", x: 610, y: 60 },
      { id: "vs-api", label: "Playback API", x: 400, y: 185 },
      { id: "vs-meta", label: "Metadata DB", x: 610, y: 185 },
      { id: "vs-reco", label: "Recommendations", x: 610, y: 260 },
    ],
    edges: [
      { id: "vs-e1", source: "vs-client", target: "vs-cdn", label: "segment request" },
      { id: "vs-e2", source: "vs-cdn", target: "vs-origin", label: "cache miss" },
      { id: "vs-e3", source: "vs-origin", target: "vs-transcode", label: "encode pipeline" },
      { id: "vs-e4", source: "vs-client", target: "vs-api", label: "session metadata" },
      { id: "vs-e5", source: "vs-api", target: "vs-meta", label: "title lookup" },
      { id: "vs-e6", source: "vs-api", target: "vs-reco", label: "recommendation" },
    ],
    activeNodes: ["vs-client", "vs-cdn", "vs-origin", "vs-transcode", "vs-api", "vs-meta", "vs-reco"],
    activeEdges: ["vs-e1", "vs-e2", "vs-e3", "vs-e4", "vs-e5", "vs-e6"],
  },
  {
    id: "realtime-chat",
    title: "Realtime Chat",
    vibe: "Ordering + fanout reliability",
    confidence: 95,
    question:
      "Design a realtime chat platform for 50M users with 1M concurrent connections, ordering guarantees, and offline sync.",
    snapshot: [
      "WebSocket gateways maintain persistent sessions and presence heartbeats.",
      "Messages are persisted then published via event bus for fanout consistency.",
      "Fanout workers push to online users and queue offline deliveries.",
      "Redis presence cache + durable message store support fast reconnect sync.",
    ],
    insight:
      "This graph focuses on durable messaging and high-throughput realtime fanout.",
    kpis: ["1M concurrent sockets", "ordered delivery", "offline sync"],
    nodes: [
      { id: "ch-client", label: "Mobile/Web Client", x: 0, y: 120 },
      { id: "ch-ws", label: "WebSocket Gateway", x: 200, y: 120 },
      { id: "ch-msg", label: "Message Service", x: 410, y: 120 },
      { id: "ch-bus", label: "Event Bus", x: 620, y: 120 },
      { id: "ch-fanout", label: "Fanout Workers", x: 620, y: 220 },
      { id: "ch-redis", label: "Presence Redis", x: 410, y: 230 },
      { id: "ch-store", label: "Message Store", x: 220, y: 230 },
    ],
    edges: [
      { id: "ch-e1", source: "ch-client", target: "ch-ws", label: "persistent socket" },
      { id: "ch-e2", source: "ch-ws", target: "ch-msg", label: "ingest" },
      { id: "ch-e3", source: "ch-msg", target: "ch-bus", label: "publish" },
      { id: "ch-e4", source: "ch-bus", target: "ch-fanout", label: "fanout" },
      { id: "ch-e5", source: "ch-msg", target: "ch-store", label: "persist" },
      { id: "ch-e6", source: "ch-ws", target: "ch-redis", label: "presence" },
    ],
    activeNodes: ["ch-client", "ch-ws", "ch-msg", "ch-bus", "ch-fanout", "ch-redis", "ch-store"],
    activeEdges: ["ch-e1", "ch-e2", "ch-e3", "ch-e4", "ch-e5", "ch-e6"],
  },
  {
    id: "payments",
    title: "Payments",
    vibe: "Consistency + compliance first",
    confidence: 97,
    question:
      "Design a payment platform handling 20K TPS with exactly-once ledger writes, fraud checks, retries, and strict auditability.",
    snapshot: [
      "API gateway fronts auth and request signing before risk validation.",
      "Orchestrator executes payment state machine with durable retry queues.",
      "Ledger is append-only and acts as the financial source of truth.",
      "Audit and reconciliation services ensure compliance and bank settlement integrity.",
    ],
    insight:
      "This graph highlights consistency, audit trails, and resilient payment orchestration.",
    kpis: ["20K TPS", "exactly-once ledger", "audit trail"],
    nodes: [
      { id: "pm-client", label: "Merchant API", x: 0, y: 120 },
      { id: "pm-gw", label: "API Gateway", x: 180, y: 120 },
      { id: "pm-risk", label: "Auth + Risk", x: 360, y: 120 },
      { id: "pm-orch", label: "Payment Orchestrator", x: 540, y: 120 },
      { id: "pm-ledger", label: "Ledger", x: 540, y: 230 },
      { id: "pm-rails", label: "Bank/Card Rails", x: 730, y: 120 },
      { id: "pm-audit", label: "Audit + Reconciliation", x: 730, y: 230 },
    ],
    edges: [
      { id: "pm-e1", source: "pm-client", target: "pm-gw", label: "signed request" },
      { id: "pm-e2", source: "pm-gw", target: "pm-risk", label: "auth + fraud" },
      { id: "pm-e3", source: "pm-risk", target: "pm-orch", label: "approved intent" },
      { id: "pm-e4", source: "pm-orch", target: "pm-ledger", label: "append ledger" },
      { id: "pm-e5", source: "pm-orch", target: "pm-rails", label: "capture" },
      { id: "pm-e6", source: "pm-ledger", target: "pm-audit", label: "reconcile" },
    ],
    activeNodes: ["pm-client", "pm-gw", "pm-risk", "pm-orch", "pm-ledger", "pm-rails", "pm-audit"],
    activeEdges: ["pm-e1", "pm-e2", "pm-e3", "pm-e4", "pm-e5", "pm-e6"],
  },
];

export function ExampleDesignFlow() {
  const [activeScenario, setActiveScenario] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const state = SCENARIOS[activeScenario] ?? SCENARIOS[0];

  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setInterval(() => {
      setActiveScenario((prev) => (prev + 1) % SCENARIOS.length);
    }, 2800);

    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const nodes = useMemo(() => {
    const active = new Set(state.activeNodes);
    return state.nodes.map<Node>((node) => ({
      id: node.id,
      position: { x: node.x, y: node.y },
      data: { label: node.label },
      style: {
        background: active.has(node.id)
          ? "linear-gradient(160deg, rgba(34,211,238,0.22), rgba(16,185,129,0.12))"
          : "rgba(15, 23, 42, 0.72)",
        color: "#e5edf7",
        border: active.has(node.id)
          ? "1px solid rgba(103,232,249,0.7)"
          : "1px solid rgba(148,163,184,0.28)",
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 600,
        padding: 8,
        transition: "all 220ms ease",
        boxShadow: active.has(node.id)
          ? "0 0 20px rgba(34,211,238,0.24)"
          : "none",
      },
    }));
  }, [state]);

  const edges = useMemo(() => {
    const active = new Set(state.activeEdges);
    return state.edges.map<Edge>((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      animated: active.has(edge.id),
      style: {
        stroke: active.has(edge.id) ? "#67e8f9" : "rgba(148,163,184,0.34)",
        strokeWidth: active.has(edge.id) ? 2.4 : 1.2,
      },
      label: edge.label,
      labelStyle: {
        fill: active.has(edge.id) ? "#cffafe" : "#94a3b8",
        fontSize: 10,
        fontWeight: 600,
      },
      labelBgStyle: {
        fill: "#08101b",
        opacity: 0.8,
      },
      labelBgBorderRadius: 4,
      labelBgPadding: [4, 2],
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: active.has(edge.id) ? "#67e8f9" : "rgba(148,163,184,0.42)",
      },
    }));
  }, [state]);

  return (
    <div className="rounded-xl border border-white/12 bg-[#050c17]/70 p-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-cyan-200/35 bg-cyan-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan-200">
            Preview Lab
          </span>
          <span className="text-xs text-slate-400">{state.vibe}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveScenario((prev) => (prev - 1 + SCENARIOS.length) % SCENARIOS.length)}
            aria-label="Previous scenario"
            title="Previous"
            className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-white/15 bg-white/5 text-slate-200 transition hover:border-cyan-200/40 hover:text-cyan-100"
          >
            <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
              <path d="M12.7 4.4a1 1 0 0 1 0 1.4L8.5 10l4.2 4.2a1 1 0 0 1-1.4 1.4l-4.9-4.9a1 1 0 0 1 0-1.4l4.9-4.9a1 1 0 0 1 1.4 0Z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setIsAutoPlaying((prev) => !prev)}
            aria-label={isAutoPlaying ? "Pause auto play" : "Play auto"}
            title={isAutoPlaying ? "Pause Auto" : "Play Auto"}
            className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-cyan-200/30 bg-cyan-400/10 text-cyan-100 transition hover:border-cyan-200/60"
          >
            {isAutoPlaying ? (
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
                <path d="M6.5 4.5A1.5 1.5 0 0 1 8 6v8a1.5 1.5 0 0 1-3 0V6a1.5 1.5 0 0 1 1.5-1.5Zm7 0A1.5 1.5 0 0 1 15 6v8a1.5 1.5 0 0 1-3 0V6a1.5 1.5 0 0 1 1.5-1.5Z" />
              </svg>
            ) : (
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
                <path d="M7.2 4.6a1 1 0 0 1 1.5-.9l7 4.3a1 1 0 0 1 0 1.8l-7 4.3A1 1 0 0 1 7.2 13V4.6Z" />
              </svg>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveScenario((prev) => (prev + 1) % SCENARIOS.length)}
            aria-label="Next scenario"
            title="Next"
            className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-white/15 bg-white/5 text-slate-200 transition hover:border-cyan-200/40 hover:text-cyan-100"
          >
            <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
              <path d="M7.3 4.4a1 1 0 0 0 0 1.4L11.5 10l-4.2 4.2a1 1 0 1 0 1.4 1.4l4.9-4.9a1 1 0 0 0 0-1.4L8.7 4.4a1 1 0 0 0-1.4 0Z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {SCENARIOS.map((scenario, index) => (
          <button
            key={scenario.id}
            type="button"
            onClick={() => {
              setActiveScenario(index);
              setIsAutoPlaying(false);
            }}
            className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs transition ${
              activeScenario === index
                ? "border-cyan-200/65 bg-cyan-400/15 text-cyan-100"
                : "border-white/15 bg-white/5 text-slate-300 hover:border-cyan-200/30 hover:text-cyan-100"
            }`}
          >
            <span className="mr-1 text-cyan-200">{index + 1}</span>
            {scenario.title}
          </button>
        ))}
      </div>

      <div className="mt-3 rounded-lg border border-cyan-200/18 bg-cyan-400/6 px-3 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-200">
          Selected Complex Question
        </p>
        <p className="mt-2 text-sm text-white">{state.question}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {state.kpis.map((kpi) => (
            <span
              key={kpi}
              className="rounded-full border border-emerald-200/25 bg-emerald-400/10 px-2 py-1 text-[11px] text-emerald-100"
            >
              {kpi}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-emerald-200/18 bg-emerald-400/6 px-3 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-200">
            Example Answer Snapshot
          </p>
          <ul className="mt-3 space-y-2 text-xs text-slate-200">
            {state.snapshot.map((point) => (
              <li key={point} className="flex gap-2">
                <span aria-hidden className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-300" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="h-75 overflow-hidden rounded-lg border border-white/10">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.5}
            maxZoom={1.3}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            zoomOnScroll={false}
            panOnDrag={false}
            proOptions={{ hideAttribution: true }}
            colorMode="dark"
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="rgba(148,163,184,0.25)"
            />
            <Controls
              position="bottom-right"
              showInteractive={false}
              className="rounded-md! border! border-white/10! bg-[#0b1320]! shadow-none!"
            />
          </ReactFlow>
        </div>
      </div>

      <p className="mt-3 rounded-lg border border-emerald-200/20 bg-emerald-400/8 px-3 py-2 text-xs text-emerald-100">
        <span className="font-semibold text-emerald-200">Architecture Insight:</span> {state.insight}
      </p>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full bg-linear-to-r from-cyan-300 to-emerald-300 transition-all duration-500"
          style={{ width: `${state.confidence}%` }}
        />
      </div>
      <p className="mt-1 text-[11px] text-slate-400">
        Preview confidence score: <span className="text-slate-200">{state.confidence}%</span>
      </p>
    </div>
  );
}