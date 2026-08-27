import "server-only";
import { prisma } from "@/lib/prisma";
import { computePriceBreakdown, computeRecipeCost, type PriceBreakdown } from "@/lib/pricing";
import { getSettings } from "@/lib/settings";
import type { Product, ProductType, Settings } from "@prisma/client";

type ProductWithRecipe = Product & {
  recipe: { ingredients: { quantity: unknown; ingredient: { costPerBaseUnit: unknown } }[] } | null;
};

/** Público: lo único que el cliente del constructor puede ver de un producto. */
export interface PublicProduct {
  id: string;
  type: ProductType;
  name: string;
  slug: string;
  description: string | null;
  colorHex: string | null;
  visualStyle: string | null;
  imageUrl: string | null;
  decorationCategory: string | null;
  isCustom: boolean;
  active: boolean;
  /** null cuando isCustom = true ("A confirmar"). */
  price: number | null;
}

/** Interno/admin: incluye desglose de costo y margen. Nunca exponer en endpoints públicos. */
export interface ProductWithBreakdown extends PublicProduct {
  breakdown: PriceBreakdown | null;
}

function priceBreakdownFor(
  product: ProductWithRecipe,
  defaultMarginPercent: number,
  marginMethod: "COST_PLUS" | "MARGIN_ON_PRICE",
  roundingIncrement: number
): PriceBreakdown | null {
  if (product.isCustom) return null;
  const recipeIngredients = product.recipe?.ingredients ?? [];
  const cost = computeRecipeCost(
    recipeIngredients as { quantity: number; ingredient: { costPerBaseUnit: number } }[]
  );
  const margin = product.marginPercent !== null ? Number(product.marginPercent) : defaultMarginPercent;
  return computePriceBreakdown(cost, margin, marginMethod, roundingIncrement);
}

function toProductWithBreakdown(p: ProductWithRecipe, settings: Settings): ProductWithBreakdown {
  const breakdown = priceBreakdownFor(
    p,
    Number(settings.defaultMarginPercent),
    settings.marginMethod,
    settings.roundingIncrement
  );
  return {
    id: p.id,
    type: p.type,
    name: p.name,
    slug: p.slug,
    description: p.description,
    colorHex: p.colorHex,
    visualStyle: p.visualStyle,
    imageUrl: p.imageUrl,
    decorationCategory: p.decorationCategory,
    isCustom: p.isCustom,
    active: p.active,
    price: breakdown ? Math.round(breakdown.price) : null,
    breakdown,
  };
}

async function loadProducts(type: ProductType, activeOnly: boolean): Promise<ProductWithBreakdown[]> {
  const settings = await getSettings();
  const products = (await prisma.product.findMany({
    where: activeOnly ? { type, active: true } : { type },
    orderBy: { sortOrder: "asc" },
    include: { recipe: { include: { ingredients: { include: { ingredient: true } } } } },
  })) as unknown as ProductWithRecipe[];

  return products.map((p) => toProductWithBreakdown(p, settings));
}

function stripBreakdown(items: ProductWithBreakdown[]): PublicProduct[] {
  return items.map(({ breakdown: _breakdown, ...rest }) => rest);
}

export async function getPublicSponges(): Promise<PublicProduct[]> {
  return stripBreakdown(await loadProducts("SPONGE", true));
}

export async function getPublicFillings(): Promise<PublicProduct[]> {
  return stripBreakdown(await loadProducts("FILLING", true));
}

export async function getPublicDecorations(): Promise<PublicProduct[]> {
  return stripBreakdown(await loadProducts("DECORATION", true));
}

export async function getAdminProducts(type: ProductType): Promise<ProductWithBreakdown[]> {
  return loadProducts(type, false);
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: { recipe: { include: { ingredients: { include: { ingredient: true } } } } },
  });
}

/** Precio + desglose de un solo producto por id. Usado por el admin y por el checkout de presupuestos. */
export async function getProductWithBreakdownById(id: string): Promise<ProductWithBreakdown | null> {
  const settings = await getSettings();
  const product = (await prisma.product.findUnique({
    where: { id },
    include: { recipe: { include: { ingredients: { include: { ingredient: true } } } } },
  })) as unknown as ProductWithRecipe | null;
  if (!product) return null;
  return toProductWithBreakdown(product, settings);
}
