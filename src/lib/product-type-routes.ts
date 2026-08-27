import type { ProductType } from "@prisma/client";
import { notFound } from "next/navigation";

export const PRODUCT_TYPE_ROUTES: Record<string, { type: ProductType; label: string; singular: string }> = {
  sponges: { type: "SPONGE", label: "Bizcochuelos", singular: "bizcochuelo" },
  fillings: { type: "FILLING", label: "Rellenos", singular: "relleno" },
  decorations: { type: "DECORATION", label: "Decoración", singular: "decoración" },
};

export function resolveProductTypeSlug(slug: string) {
  const entry = PRODUCT_TYPE_ROUTES[slug];
  if (!entry) notFound();
  return entry;
}
