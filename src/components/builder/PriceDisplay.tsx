"use client";

import { motion, AnimatePresence } from "framer-motion";
import { formatARS } from "@/lib/pricing";

export function PriceDisplay({ price, label = "Total estimado" }: { price: number | null; label?: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-sm text-cioco-green/70">{label}</span>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={price ?? "custom"}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.2 }}
          className="text-xl font-bold text-cioco-green"
        >
          {formatARS(price)}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
