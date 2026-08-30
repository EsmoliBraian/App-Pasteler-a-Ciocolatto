import type { PublicProduct, PublicSize } from "@/lib/products";

export type { PublicProduct, PublicSize };
export type SpongeOption = PublicProduct;
export type FillingOption = PublicProduct;
export type ToppingOption = PublicProduct;
export type DecorationOption = PublicProduct;
export type SizeOption = PublicSize;

export interface BuilderData {
  sizes: SizeOption[];
  sponges: SpongeOption[];
  fillings: FillingOption[];
  toppings: ToppingOption[];
  decorations: DecorationOption[];
  maxFillings: number;
}
