"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  generalSettingsSchema,
  whatsappSettingsSchema,
  pricingSettingsSchema,
  builderSettingsSchema,
} from "@/lib/validations/settings";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

function revalidateAll() {
  revalidatePath("/admin/settings");
  revalidatePath("/");
}

export async function updateGeneralSettingsAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = generalSettingsSchema.safeParse({
    businessName: formData.get("businessName"),
    logoUrl: formData.get("logoUrl") ?? "",
    contactInfo: formData.get("contactInfo") ?? "",
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  await prisma.settings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...parsed.data, logoUrl: parsed.data.logoUrl || null, contactInfo: parsed.data.contactInfo || null },
    update: { ...parsed.data, logoUrl: parsed.data.logoUrl || null, contactInfo: parsed.data.contactInfo || null },
  });
  revalidateAll();
  return { ok: true };
}

export async function updateWhatsappSettingsAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = whatsappSettingsSchema.safeParse({
    whatsappNumber: formData.get("whatsappNumber"),
    whatsappGreeting: formData.get("whatsappGreeting"),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  await prisma.settings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...parsed.data },
    update: parsed.data,
  });
  revalidateAll();
  return { ok: true };
}

export async function updatePricingSettingsAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = pricingSettingsSchema.safeParse({
    defaultMarginPercent: formData.get("defaultMarginPercent"),
    marginMethod: formData.get("marginMethod"),
    roundingIncrement: formData.get("roundingIncrement"),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  await prisma.settings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...parsed.data },
    update: parsed.data,
  });
  revalidateAll();
  return { ok: true };
}

export async function updateBuilderSettingsAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = builderSettingsSchema.safeParse({ maxFillings: formData.get("maxFillings") });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  await prisma.settings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...parsed.data },
    update: parsed.data,
  });
  revalidateAll();
  return { ok: true };
}
