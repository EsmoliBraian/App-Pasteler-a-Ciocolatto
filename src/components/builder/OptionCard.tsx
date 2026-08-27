"use client";

import { motion } from "framer-motion";
import { formatARS } from "@/lib/pricing";

interface OptionCardProps {
  name: string;
  price: number | null;
  description?: string | null;
  colorHex?: string | null;
  selected: boolean;
  disabled?: boolean;
  multi?: boolean;
  onClick: () => void;
}

export function OptionCard({
  name,
  price,
  description,
  colorHex,
  selected,
  disabled,
  multi,
  onClick,
}: OptionCardProps) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled && !selected}
      aria-pressed={selected}
      className={`flex w-full items-center gap-3 rounded-2xl border-2 bg-cioco-white px-4 py-3 text-left shadow-sm transition-colors ${
        selected
          ? "border-cioco-green bg-cioco-green/5"
          : "border-transparent hover:border-cioco-green/30"
      } ${disabled && !selected ? "cursor-not-allowed opacity-40" : ""}`}
    >
      <span
        className="h-10 w-10 shrink-0 rounded-full border border-black/10 shadow-inner"
        style={{ backgroundColor: colorHex ?? "#EADFC0" }}
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium text-cioco-green">{name}</span>
        {description && <span className="block truncate text-xs text-cioco-green/60">{description}</span>}
      </span>
      <span className="shrink-0 text-sm font-semibold text-cioco-brown">{formatARS(price)}</span>
      <span
        className={`ml-1 grid h-5 w-5 shrink-0 place-items-center border text-[11px] text-white ${
          multi ? "rounded-md" : "rounded-full"
        } ${selected ? "border-cioco-green bg-cioco-green" : "border-cioco-green/30 bg-transparent"}`}
      >
        {selected ? "✓" : ""}
      </span>
    </motion.button>
  );
}
