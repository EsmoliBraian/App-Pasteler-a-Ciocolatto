"use client";

import type { ReactElement } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SpongeLayer } from "./SpongeLayer";
import { FillingLayer } from "./FillingLayer";
import { DecorationLayer } from "./DecorationLayer";
import { CAKE_WIDTH, totalCakeHeight } from "./constants";
import type { SpongeOption, FillingOption, DecorationOption } from "@/lib/types";

interface CakePreviewProps {
  sponge?: SpongeOption | null;
  fillings: FillingOption[];
  decoration?: DecorationOption | null;
}

export function CakePreview({ sponge, fillings, decoration }: CakePreviewProps) {
  const height = totalCakeHeight(fillings.length);

  const layers: ReactElement[] = [];
  fillings.forEach((filling, i) => {
    layers.push(<FillingLayer key={`filling-${filling.id}-${i}`} color={filling.colorHex} />);
    layers.push(
      <SpongeLayer
        key={`sponge-${i + 1}`}
        color={sponge?.colorHex}
        isTop={i === fillings.length - 1}
      />
    );
  });
  layers.unshift(
    <SpongeLayer key="sponge-0" color={sponge?.colorHex} isTop={fillings.length === 0} />
  );

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: CAKE_WIDTH, height: height + 8 }}>
        <AnimatePresence>
          {decoration && !decoration.isCustom && (
            <DecorationLayer key="deco" visualStyle={decoration.visualStyle} cakeHeight={height} />
          )}
          {decoration?.isCustom && <DecorationLayer key="deco-custom" visualStyle="custom" cakeHeight={height} />}
        </AnimatePresence>

        <motion.div layout className="absolute inset-x-0 bottom-0 flex flex-col-reverse items-center">
          <AnimatePresence initial={false}>{layers}</AnimatePresence>
        </motion.div>
      </div>

      {/* Plato */}
      <div
        className="rounded-full bg-gradient-to-b from-white to-neutral-200 shadow-[0_8px_16px_rgba(0,0,0,0.18)]"
        style={{ width: CAKE_WIDTH * 1.35, height: 16, marginTop: -4 }}
      />
    </div>
  );
}
