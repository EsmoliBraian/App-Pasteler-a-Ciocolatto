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
  /** Precio a tamaño completo (multiplier 1). null cuando isCustom = true ("A confirmar"). */
  price: number | null;
  /** Precio final ya calculado para cada Size activa (id de Size -> precio). Vacío si isCustom. */
  pricesBySize: Record<string, number>;
}

export interface PublicSize {
  id: string;
  name: string;
  multiplier: number;
}

/** Tamaños activos, ordenados, para el paso "Medidas" del constructor. */
export async function getPublicSizes(): Promise<PublicSize[]> {
  const sizes = await prisma.size.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
  return sizes.map((s) => ({ id: s.id, name: s.name, multiplier: Number(s.multiplier) }));
}

/** Interno/admin: incluye desglose de costo y margen. Nunca exponer en endpoints públicos. */
export interface ProductWithBreakdown extends PublicProduct {
  breakdown: PriceBreakdown | null;
}

/**
 * Costo/margen/precio de un producto, con un multiplicador opcional aplicado
 * al costo de insumos ANTES del margen (usado por las Medidas: una torta
 * chica usa una fracción de la receta base, pero el margen % del producto
 * se sigue aplicando igual sobre ese costo ya reducido).
 */
function priceBreakdownFor(
  product: ProductWithRecipe,
  defaultMarginPercent: number,
  marginMethod: "COST_PLUS" | "MARGIN_ON_PRICE",
  roundingIncrement: number,
  costMultiplier: number = 1
): PriceBreakdown | null {
  if (product.isCustom) return null;
  const recipeIngredients = product.recipe?.ingredients ?? [];
  const baseCost = computeRecipeCost(
    recipeIngredients as { quantity: number; ingredient: { costPerBaseUnit: number } }[]
  );
  const margin = product.marginPercent !== null ? Number(product.marginPercent) : defaultMarginPercent;
  return computePriceBreakdown(baseCost * costMultiplier, margin, marginMethod, roundingIncrement);
}

function baseProductFields(p: ProductWithRecipe) {
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
  };
}

function toProductWithBreakdown(p: ProductWithRecipe, settings: Settings, sizes: PublicSize[] = []): ProductWithBreakdown {
  const breakdown = priceBreakdownFor(
    p,
    Number(settings.defaultMarginPercent),
    settings.marginMethod,
    settings.roundingIncrement
  );

  const pricesBySize: Record<string, number> = {};
  if (!p.isCustom) {
    for (const size of sizes) {
      const sized = priceBreakdownFor(
        p,
        Number(settings.defaultMarginPercent),
        settings.marginMethod,
        settings.roundingIncrement,
        size.multiplier
      );
      if (sized) pricesBySize[size.id] = Math.round(sized.price);
    }
  }

  return {
    ...baseProductFields(p),
    price: breakdown ? Math.round(breakdown.price) : null,
    pricesBySize,
    breakdown,
  };
}

async function loadProducts(type: ProductType, activeOnly: boolean): Promise<ProductWithBreakdown[]> {
  const [settings, sizes] = await Promise.all([getSettings(), getPublicSizes()]);
  const products = (await prisma.product.findMany({
    where: activeOnly ? { type, active: true } : { type },
    orderBy: { sortOrder: "asc" },
    include: { recipe: { include: { ingredients: { include: { ingredient: true } } } } },
  })) as unknown as ProductWithRecipe[];

  return products.map((p) => toProductWithBreakdown(p, settings, sizes));
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

export async function getPublicToppings(): Promise<PublicProduct[]> {
  return stripBreakdown(await loadProducts("TOPPING", true));
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

/**
 * Precio + desglose de un solo producto por id, con multiplicador de Medida
 * opcional. Usado por el admin (sin multiplicador, tamaño completo) y por la
 * creación de presupuestos (recalcula el precio real y autoritativo al tamaño
 * elegido por el cliente — nunca se confía en el precio que manda el cliente).
 */
export async function getProductWithBreakdownById(id: string, costMultiplier: number = 1): Promise<ProductWithBreakdown | null> {
  const settings = await getSettings();
  const product = (await prisma.product.findUnique({
    where: { id },
    include: { recipe: { include: { ingredients: { include: { ingredient: true } } } } },
  })) as unknown as ProductWithRecipe | null;
  if (!product) return null;

  const breakdown = priceBreakdownFor(
    product,
    Number(settings.defaultMarginPercent),
    settings.marginMethod,
    settings.roundingIncrement,
    costMultiplier
  );

  return {
    ...baseProductFields(product),
    price: breakdown ? Math.round(breakdown.price) : null,
    pricesBySize: {},
    breakdown,
  };
}
