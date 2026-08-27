"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Envoltorio con perspectiva 3D. Gira sobre su eje Y cada vez que `spinToken`
 * cambia (se incrementa al presionar "Continuar"), dando la sensación de que
 * la torta se transforma al avanzar de paso.
 */
export function CakeStage({ spinToken, children }: { spinToken: number; children: ReactNode }) {
  return (
    <div style={{ perspective: 900 }} className="flex justify-center py-4">
      <motion.div
        key={spinToken}
        initial={{ rotateY: 0, scale: 1 }}
        animate={{ rotateY: [0, 360], scale: [1, 0.9, 1.02, 1] }}
        transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {children}
      </motion.div>
    </div>
  );
}
