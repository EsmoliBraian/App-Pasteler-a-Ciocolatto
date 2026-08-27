"use client";

import { motion } from "framer-motion";
import { CAKE_WIDTH, FILLING_HEIGHT, DEFAULT_FILLING_COLOR } from "./constants";

export function FillingLayer({ color }: { color?: string | null }) {
  const base = color ?? DEFAULT_FILLING_COLOR;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scaleY: 0, scaleX: 0.85 }}
      animate={{ opacity: 1, scaleY: 1, scaleX: 1.06 }}
      exit={{ opacity: 0, scaleY: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      style={{
        width: CAKE_WIDTH,
        height: FILLING_HEIGHT,
        background: base,
        marginLeft: -CAKE_WIDTH * 0.03,
      }}
      className="shrink-0 rounded-[3px] shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
    />
  );
}
