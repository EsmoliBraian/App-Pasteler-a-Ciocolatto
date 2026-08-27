import type { PublicProduct } from "@/lib/products";

export type SpongeOption = PublicProduct;
export type FillingOption = PublicProduct;
export type DecorationOption = PublicProduct;

export interface BuilderData {
  sponges: SpongeOption[];
  fillings: FillingOption[];
  decorations: DecorationOption[];
  maxFillings: number;
}
