"use client";

import { motion } from "framer-motion";

type Props = {
  message?: string;
};

const SHIMMER_NODES = [
  { x: 60,  y: 100, w: 110 },
  { x: 360, y: 40,  w: 120 },
  { x: 360, y: 200, w: 120 },
  { x: 360, y: 360, w: 120 },
  { x: 660, y: 100, w: 130 },
  { x: 660, y: 280, w: 130 },
  { x: 960, y: 180, w: 140 },
];

export function LoadingOverlay({ message = "Generating architecture…" }: Props) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#070b11]/80 backdrop-blur-sm">
      {/* Shimmer node skeletons */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {SHIMMER_NODES.map((n, i) => (
          <motion.div
            key={i}
            className="absolute h-14 rounded-lg border border-white/10 bg-white/4"
            style={{ left: n.x, top: n.y, width: n.w }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
        {/* Shimmer connecting lines */}
        {SHIMMER_NODES.slice(1).map((_, i) => (
          <motion.div
            key={`line-${i}`}
            className="absolute h-px bg-white/10"
            style={{
              left: SHIMMER_NODES[i].x + (SHIMMER_NODES[i].w ?? 120),
              top: SHIMMER_NODES[i].y + 28,
              width: SHIMMER_NODES[i + 1].x - (SHIMMER_NODES[i].x + (SHIMMER_NODES[i].w ?? 120)),
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.1 }}
          />
        ))}
      </div>

      {/* Status message */}
      <div className="relative z-10 flex flex-col items-center gap-3">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-sky-400"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
        <p className="text-[12px] font-medium tracking-wide text-white/60">{message}</p>
      </div>
    </div>
  );
}
