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
    supplier: formData.get("supplier") ?? "",
    purchaseUnit: formData.get("purchaseUnit"),
    purchaseQuantity: formData.get("purchaseQuantity"),
    purchasePrice: formData.get("purchasePrice"),
    active: formData.get("active") === "on",
  });
}

export async function createIngredientAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = parseFormData(formData);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  const { name, supplier, purchaseUnit, purchaseQuantity, purchasePrice, active } = parsed.data;
  const baseUnit = baseUnitForPurchaseUnit(purchaseUnit);
  const costPerBaseUnit = computeCostPerBaseUnit(purchasePrice, purchaseQuantity, purchaseUnit);

  await prisma.ingredient.create({
    data: { name, supplier: supplier || null, purchaseUnit, baseUnit, purchaseQuantity, purchasePrice, costPerBaseUnit, active },
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

  const { name, supplier, purchaseUnit, purchaseQuantity, purchasePrice, active } = parsed.data;
  const baseUnit = baseUnitForPurchaseUnit(purchaseUnit);
  const costPerBaseUnit = computeCostPerBaseUnit(purchasePrice, purchaseQuantity, purchaseUnit);

  await prisma.ingredient.update({
    where: { id },
    data: { name, supplier: supplier || null, purchaseUnit, baseUnit, purchaseQuantity, purchasePrice, costPerBaseUnit, active },
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
