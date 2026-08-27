"use client";

import { motion } from "framer-motion";
import { CAKE_WIDTH, SPONGE_HEIGHT, DEFAULT_SPONGE_COLOR } from "./constants";

export function SpongeLayer({ color, isTop }: { color?: string | null; isTop?: boolean }) {
  const base = color ?? DEFAULT_SPONGE_COLOR;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scaleY: 0.4 }}
      animate={{ opacity: 1, scaleY: 1 }}
      exit={{ opacity: 0, scaleY: 0.4 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      style={{
        width: CAKE_WIDTH,
        height: SPONGE_HEIGHT,
        background: `linear-gradient(180deg, color-mix(in srgb, ${base} 88%, white) 0%, ${base} 55%, color-mix(in srgb, ${base} 82%, black) 100%)`,
        borderRadius: isTop ? "10px 10px 4px 4px" : "4px",
      }}
      className="shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
    />
  );
}
