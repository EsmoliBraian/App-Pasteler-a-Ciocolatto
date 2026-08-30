"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { sizeSchema } from "@/lib/validations/size";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

function parseFormData(formData: FormData) {
  return sizeSchema.safeParse({
    name: formData.get("name"),
    percent: formData.get("percent"),
    active: formData.get("active") === "on",
    sortOrder: formData.get("sortOrder") ?? 0,
  });
}

export async function createSizeAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = parseFormData(formData);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  const { name, percent, active, sortOrder } = parsed.data;

  await prisma.size.create({
    data: { name, multiplier: percent / 100, active, sortOrder },
  });

  revalidatePath("/admin/sizes");
  revalidatePath("/");
  return { ok: true };
}

export async function updateSizeAction(id: string, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = parseFormData(formData);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  const { name, percent, active, sortOrder } = parsed.data;

  await prisma.size.update({
    where: { id },
    data: { name, multiplier: percent / 100, active, sortOrder },
  });

  revalidatePath("/admin/sizes");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteSizeAction(id: string): Promise<ActionResult> {
  const usageCount = await prisma.quote.count({ where: { sizeId: id } });
  if (usageCount > 0) {
    await prisma.size.update({ where: { id }, data: { active: false } });
    revalidatePath("/admin/sizes");
    return { ok: true, error: `La medida se desactivó (aparece en ${usageCount} presupuesto(s) históricos)` };
  }

  await prisma.size.delete({ where: { id } });
  revalidatePath("/admin/sizes");
  revalidatePath("/");
  return { ok: true };
}
