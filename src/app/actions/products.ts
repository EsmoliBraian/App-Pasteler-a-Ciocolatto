"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations/product";
import type { ProductType } from "@prisma/client";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseFormData(formData: FormData, type: ProductType) {
  let ingredients: unknown = [];
  const raw = formData.get("ingredientsJson");
  if (typeof raw === "string" && raw.length > 0) {
    try {
      ingredients = JSON.parse(raw);
    } catch {
      ingredients = [];
    }
  }

  const marginRaw = formData.get("marginPercent");

  return productSchema.safeParse({
    type,
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    colorHex: formData.get("colorHex") ?? "",
    visualStyle: formData.get("visualStyle") ?? "",
    imageUrl: formData.get("imageUrl") ?? "",
    decorationCategory: formData.get("decorationCategory") || undefined,
    isCustom: formData.get("isCustom") === "on",
    marginPercent: marginRaw ? Number(marginRaw) : undefined,
    active: formData.get("active") === "on",
    sortOrder: formData.get("sortOrder") ?? 0,
    ingredients,
  });
}

function pathsForType(type: ProductType): string[] {
  const map: Record<ProductType, string> = {
    SPONGE: "/admin/products/sponges",
    FILLING: "/admin/products/fillings",
    TOPPING: "/admin/products/toppings",
    DECORATION: "/admin/products/decorations",
  };
  return [map[type], "/"];
}

export async function createProductAction(
  type: ProductType,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = parseFormData(formData, type);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  const data = parsed.data;

  const baseSlug = slugify(`${type}-${data.name}`);
  let slug = baseSlug;
  let suffix = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${++suffix}`;
  }

  await prisma.product.create({
    data: {
      type,
      name: data.name,
      slug,
      description: data.description || null,
      colorHex: data.colorHex || null,
      visualStyle: data.visualStyle || null,
      imageUrl: data.imageUrl || null,
      decorationCategory: type === "DECORATION" ? data.decorationCategory : undefined,
      isCustom: data.isCustom,
      marginPercent: data.marginPercent ?? null,
      active: data.active,
      sortOrder: data.sortOrder,
      recipe: data.isCustom
        ? undefined
        : {
            create: {
              ingredients: { create: data.ingredients.map((i) => ({ ingredientId: i.ingredientId, quantity: i.quantity })) },
            },
          },
    },
  });

  for (const p of pathsForType(type)) revalidatePath(p);
  return { ok: true };
}

export async function updateProductAction(
  id: string,
  type: ProductType,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = parseFormData(formData, type);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  const data = parsed.data;

  await prisma.product.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description || null,
      colorHex: data.colorHex || null,
      visualStyle: data.visualStyle || null,
      imageUrl: data.imageUrl || null,
      decorationCategory: type === "DECORATION" ? data.decorationCategory : undefined,
      isCustom: data.isCustom,
      marginPercent: data.marginPercent ?? null,
      active: data.active,
      sortOrder: data.sortOrder,
    },
  });

  if (data.isCustom) {
    await prisma.recipe.deleteMany({ where: { productId: id } });
  } else {
    const recipe = await prisma.recipe.upsert({
      where: { productId: id },
      create: { productId: id },
      update: {},
    });
    await prisma.recipeIngredient.deleteMany({ where: { recipeId: recipe.id } });
    if (data.ingredients.length > 0) {
      await prisma.recipeIngredient.createMany({
        data: data.ingredients.map((i) => ({ recipeId: recipe.id, ingredientId: i.ingredientId, quantity: i.quantity })),
      });
    }
  }

  for (const p of pathsForType(type)) revalidatePath(p);
  return { ok: true };
}

export async function deleteProductAction(id: string, type: ProductType): Promise<ActionResult> {
  const usageCount = await prisma.quoteItem.count({ where: { productId: id } });
  if (usageCount > 0) {
    await prisma.product.update({ where: { id }, data: { active: false } });
    for (const p of pathsForType(type)) revalidatePath(p);
    return { ok: true, error: `El producto se desactivó (aparece en ${usageCount} presupuesto(s) históricos)` };
  }

  await prisma.recipe.deleteMany({ where: { productId: id } });
  await prisma.product.delete({ where: { id } });
  for (const p of pathsForType(type)) revalidatePath(p);
  return { ok: true };
}
