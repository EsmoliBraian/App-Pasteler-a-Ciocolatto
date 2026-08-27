"use client";

import { motion } from "framer-motion";
import { CAKE_WIDTH } from "./constants";

const STYLE_COLORS: Record<string, string> = {
  chantilly: "#FFFDF6",
  ganache: "#3B2418",
  meringue: "#FBF1D8",
  rustic: "#D8C6A8",
  seminaked: "#FFFDF6",
  dripcake: "#4A2A1D",
  custom: "#C9A24B",
};

function Dollops({ color }: { color: string }) {
  const count = 6;
  return (
    <div className="absolute -top-3 left-0 right-0 flex justify-center gap-[6px]">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.2)]"
          style={{
            width: 20,
            height: 20,
            background: `radial-gradient(circle at 35% 30%, color-mix(in srgb, ${color} 90%, white), ${color})`,
          }}
        />
      ))}
    </div>
  );
}

function Peaks({ color }: { color: string }) {
  const count = 7;
  return (
    <div className="absolute -top-4 left-0 right-0 flex justify-center gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 0,
            height: 0,
            borderLeft: "9px solid transparent",
            borderRight: "9px solid transparent",
            borderBottom: `18px solid ${color}`,
            filter: i % 2 === 0 ? "brightness(0.96)" : "brightness(1.04)",
          }}
        />
      ))}
    </div>
  );
}

function Drips({ color, long }: { color: string; long?: boolean }) {
  const count = 8;
  return (
    <div className="absolute top-0 left-0 right-0 flex justify-between px-1">
      {Array.from({ length: count }).map((_, i) => {
        const h = long ? 22 + ((i * 13) % 26) : 14 + ((i * 9) % 16);
        return (
          <div
            key={i}
            style={{
              width: 12,
              height: h,
              background: color,
              borderRadius: "0 0 8px 8px",
            }}
          />
        );
      })}
    </div>
  );
}

function CustomBadge() {
  return (
    <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
      <div className="grid h-9 w-9 place-items-center rounded-full border-2 border-dashed border-cioco-gold bg-cioco-white/90 text-cioco-green text-base">
        ✨
      </div>
    </div>
  );
}

export function DecorationLayer({
  visualStyle,
  cakeHeight,
}: {
  visualStyle?: string | null;
  cakeHeight: number;
}) {
  const style = visualStyle ?? "chantilly";
  const color = STYLE_COLORS[style] ?? STYLE_COLORS.chantilly;

  return (
    <motion.div
      key={style}
      initial={{ opacity: 0, y: -10, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="pointer-events-none absolute inset-x-0 top-0 z-20"
      style={{ height: cakeHeight, width: CAKE_WIDTH, marginInline: "auto" }}
    >
      {/* Cap: cobertura pareja sobre la torta */}
      <div
        className="absolute inset-x-0 top-0 rounded-t-[10px]"
        style={{
          height: style === "rustic" ? cakeHeight : Math.min(18, cakeHeight),
          background:
            style === "seminaked"
              ? `linear-gradient(180deg, ${color}dd 0%, ${color}55 55%, transparent 100%)`
              : style === "rustic"
                ? `repeating-linear-gradient(100deg, ${color} 0px, ${color} 10px, color-mix(in srgb, ${color} 80%, white) 10px, color-mix(in srgb, ${color} 80%, white) 20px)`
                : color,
          opacity: style === "rustic" ? 0.92 : 1,
        }}
      />

      {(style === "chantilly" || style === "meringue") && <Dollops color={color} />}
      {style === "meringue" && <Peaks color={color} />}
      {(style === "ganache" || style === "dripcake") && (
        <Drips color={color} long={style === "dripcake"} />
      )}
      {style === "custom" && <CustomBadge />}
    </motion.div>
  );
}
