"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ingredientSchema } from "@/lib/validations/ingredient";
import { computeCostPerBaseUnit, baseUnitForPurchaseUnit } from "@/lib/pricing";

export interface ActionResult {
  ok: boolean;
  error?: string;
  affectedRecipes?: number;
}

function parseFormData(formData: FormData) {
  return ingredientSchema.safeParse({
    name: formData.get("name"),
    categoryId: formData.get("categoryId") ?? "",
    newCategoryName: formData.get("newCategoryName") ?? "",
    purchaseUnit: formData.get("purchaseUnit"),
    purchasePrice: formData.get("purchasePrice"),
    trackStock: formData.get("trackStock") === "on",
    stockQuantity: formData.get("stockQuantity") || undefined,
    providerId: formData.get("providerId") ?? "",
    newProviderName: formData.get("newProviderName") ?? "",
    active: formData.get("active") === "on",
  });
}

/** Resuelve el proveedor final: si se cargó un nombre nuevo, lo crea (o
 * reutiliza uno existente con el mismo nombre); si no, usa el seleccionado. */
async function resolveProviderId(providerId: string | undefined, newProviderName: string | undefined) {
  const trimmedNew = newProviderName?.trim();
  if (trimmedNew) {
    const existing = await prisma.provider.findFirst({
      where: { name: { equals: trimmedNew, mode: "insensitive" } },
    });
    if (existing) return existing.id;
    const created = await prisma.provider.create({ data: { name: trimmedNew } });
    return created.id;
  }
  return providerId && providerId.length > 0 ? providerId : null;
}

/** Resuelve la categoría final: si se cargó un nombre nuevo, lo crea (o
 * reutiliza una existente con el mismo nombre); si no, usa la seleccionada. */
async function resolveCategoryId(categoryId: string | undefined, newCategoryName: string | undefined) {
  const trimmedNew = newCategoryName?.trim();
  if (trimmedNew) {
    const existing = await prisma.category.findFirst({
      where: { name: { equals: trimmedNew, mode: "insensitive" } },
    });
    if (existing) return existing.id;
    const created = await prisma.category.create({ data: { name: trimmedNew } });
    return created.id;
  }
  return categoryId && categoryId.length > 0 ? categoryId : null;
}

export async function createIngredientAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = parseFormData(formData);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  const {
    name,
    categoryId,
    newCategoryName,
    purchaseUnit,
    purchasePrice,
    trackStock,
    stockQuantity,
    providerId,
    newProviderName,
    active,
  } = parsed.data;
  const baseUnit = baseUnitForPurchaseUnit(purchaseUnit);
  const costPerBaseUnit = computeCostPerBaseUnit(purchasePrice, 1, purchaseUnit);
  const resolvedProviderId = await resolveProviderId(providerId, newProviderName);
  const resolvedCategoryId = await resolveCategoryId(categoryId, newCategoryName);

  await prisma.ingredient.create({
    data: {
      name,
      categoryId: resolvedCategoryId,
      purchaseUnit,
      baseUnit,
      purchaseQuantity: 1,
      purchasePrice,
      costPerBaseUnit,
      trackStock,
      stockQuantity: trackStock ? (stockQuantity ?? 0) : null,
      providerId: resolvedProviderId,
      active,
    },
  });

  revalidatePath("/admin/ingredients");
  return { ok: true };
}

export async function updateIngredientAction(
  id: string,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = parseFormData(formData);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  const {
    name,
    categoryId,
    newCategoryName,
    purchaseUnit,
    purchasePrice,
    trackStock,
    stockQuantity,
    providerId,
    newProviderName,
    active,
  } = parsed.data;
  const baseUnit = baseUnitForPurchaseUnit(purchaseUnit);
  const costPerBaseUnit = computeCostPerBaseUnit(purchasePrice, 1, purchaseUnit);
  const resolvedProviderId = await resolveProviderId(providerId, newProviderName);
  const resolvedCategoryId = await resolveCategoryId(categoryId, newCategoryName);

  await prisma.ingredient.update({
    where: { id },
    data: {
      name,
      categoryId: resolvedCategoryId,
      purchaseUnit,
      baseUnit,
      purchaseQuantity: 1,
      purchasePrice,
      costPerBaseUnit,
      trackStock,
      stockQuantity: trackStock ? (stockQuantity ?? 0) : null,
      providerId: resolvedProviderId,
      active,
    },
  });

  const affectedRecipes = await prisma.recipeIngredient.count({ where: { ingredientId: id } });

  revalidatePath("/admin/ingredients");
  revalidatePath("/admin/products/sponges");
  revalidatePath("/admin/products/fillings");
  revalidatePath("/admin/products/decorations");
  revalidatePath("/");
  return { ok: true, affectedRecipes };
}

export async function deleteIngredientAction(id: string): Promise<ActionResult> {
  const usageCount = await prisma.recipeIngredient.count({ where: { ingredientId: id } });
  if (usageCount > 0) {
    await prisma.ingredient.update({ where: { id }, data: { active: false } });
    revalidatePath("/admin/ingredients");
    return { ok: true, error: `El insumo se desactivó (está usado en ${usageCount} receta(s))` };
  }

  await prisma.ingredient.delete({ where: { id } });
  revalidatePath("/admin/ingredients");
  return { ok: true };
}
