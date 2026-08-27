import type { MarginMethod, PurchaseUnit, BaseUnit, Prisma } from "@prisma/client";

type Decimal = Prisma.Decimal;

/**
 * Motor de cálculo de costos y precios.
 *
 * Fórmula por defecto (documentada en el spec del producto):
 *   COST_PLUS:        precio = costo * (1 + margen / 100)
 *   MARGIN_ON_PRICE:  precio = costo / (1 - margen / 100)
 *
 * Nada de esto se guarda como precio fijo en Product: se recalcula siempre
 * a partir del costo del insumo/receta vigente. Los presupuestos (Quote/QuoteItem)
 * sí congelan el resultado en el momento de cotizar.
 */

const PURCHASE_TO_BASE_FACTOR: Record<PurchaseUnit, number> = {
  KILOGRAM: 1000,
  GRAM: 1,
  LITER: 1000,
  MILLILITER: 1,
  UNIT: 1,
};

const PURCHASE_TO_BASE_UNIT: Record<PurchaseUnit, BaseUnit> = {
  KILOGRAM: "GRAM",
  GRAM: "GRAM",
  LITER: "MILLILITER",
  MILLILITER: "MILLILITER",
  UNIT: "UNIT",
};

export function baseUnitForPurchaseUnit(purchaseUnit: PurchaseUnit): BaseUnit {
  return PURCHASE_TO_BASE_UNIT[purchaseUnit];
}

/** Costo por unidad base (g / ml / unidad), a partir de precio y cantidad de compra. */
export function computeCostPerBaseUnit(
  purchasePrice: number,
  purchaseQuantity: number,
  purchaseUnit: PurchaseUnit
): number {
  if (purchaseQuantity <= 0) return 0;
  const factor = PURCHASE_TO_BASE_FACTOR[purchaseUnit];
  const quantityInBaseUnit = purchaseQuantity * factor;
  return purchasePrice / quantityInBaseUnit;
}

export interface RecipeIngredientLike {
  quantity: Decimal | number;
  ingredient: { costPerBaseUnit: Decimal | number };
}

/** Costo total de una receta: suma de (cantidad usada × costo por unidad base). */
export function computeRecipeCost(recipeIngredients: RecipeIngredientLike[]): number {
  return recipeIngredients.reduce((total, ri) => {
    const qty = Number(ri.quantity);
    const cost = Number(ri.ingredient.costPerBaseUnit);
    return total + qty * cost;
  }, 0);
}

export function applyMargin(cost: number, marginPercent: number, method: MarginMethod): number {
  if (method === "MARGIN_ON_PRICE") {
    const divisor = 1 - marginPercent / 100;
    if (divisor <= 0) return cost; // margen inválido (>=100%), evitar división por 0/negativo
    return cost / divisor;
  }
  // COST_PLUS
  return cost * (1 + marginPercent / 100);
}

export function applyRounding(price: number, increment: number): number {
  if (!increment || increment <= 0) return price;
  return Math.round(price / increment) * increment;
}

export interface PriceBreakdown {
  cost: number;
  marginPercent: number;
  marginMethod: MarginMethod;
  priceBeforeRounding: number;
  price: number;
}

export function computePriceBreakdown(
  cost: number,
  marginPercent: number,
  method: MarginMethod,
  roundingIncrement: number
): PriceBreakdown {
  const priceBeforeRounding = applyMargin(cost, marginPercent, method);
  const price = applyRounding(priceBeforeRounding, roundingIncrement);
  return { cost, marginPercent, marginMethod: method, priceBeforeRounding, price };
}

export function formatARS(value: number | null | undefined): string {
  if (value === null || value === undefined) return "A confirmar";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}
