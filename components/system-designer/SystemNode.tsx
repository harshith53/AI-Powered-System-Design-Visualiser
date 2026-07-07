"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { NodeType } from "@/types/architecture";

export type SystemNodeData = {
  label: string;
  sublabel?: string;
  type: NodeType;
  active?: boolean;
  selected?: boolean;
};

const TYPE_META: Record<NodeType, { glyph: string; tone: string }> = {
  client: { glyph: "◐", tone: "text-sky-300" },
  edge: { glyph: "◇", tone: "text-violet-300" },
  loadbalancer: { glyph: "▤", tone: "text-amber-300" },
  server: { glyph: "▣", tone: "text-emerald-300" },
  cache: { glyph: "◉", tone: "text-rose-300" },
  logic: { glyph: "ƒ", tone: "text-fuchsia-300" },
  service: { glyph: "▶", tone: "text-emerald-200" },
  observability: { glyph: "≋", tone: "text-cyan-300" },
};

function SystemNodeImpl({ data, selected }: NodeProps) {
  const d = data as unknown as SystemNodeData;
  const meta = TYPE_META[d.type];
  const isActive = d.active;
  const isSelected = selected || d.selected;

  return (
    <div
      className={[
        "group relative min-w-[176px] rounded-lg border bg-[#0e131b] px-3 py-2.5",
        "shadow-[0_0_0_1px_rgba(255,255,255,0.02)] transition-all duration-200",
        isSelected
          ? "border-sky-400/70 shadow-[0_0_0_1px_rgba(56,189,248,0.5),0_8px_30px_-12px_rgba(56,189,248,0.45)]"
          : "border-white/10 hover:border-white/20",
        isActive
          ? "ring-1 ring-emerald-400/60 shadow-[0_0_24px_-4px_rgba(52,211,153,0.45)]"
          : "",
      ].join(" ")}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2 !w-2 !border-0 !bg-white/30"
      />
      <div className="flex items-start gap-2.5">
        <div
          className={[
            "mt-0.5 flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/[0.03] text-[15px] leading-none",
            meta.tone,
          ].join(" ")}
        >
          {meta.glyph}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-medium tracking-tight text-white">
            {d.label}
          </div>
          {d.sublabel ? (
            <div className="truncate text-[11px] uppercase tracking-wider text-white/40">
              {d.sublabel}
            </div>
          ) : null}
        </div>
      </div>
      {isActive ? (
        <div className="pointer-events-none absolute -inset-px rounded-lg ring-1 ring-emerald-300/30" />
      ) : null}
      <Handle
        type="source"
        position={Position.Right}
        className="!h-2 !w-2 !border-0 !bg-white/30"
      />
    </div>
  );
}

export const SystemNode = memo(SystemNodeImpl);
