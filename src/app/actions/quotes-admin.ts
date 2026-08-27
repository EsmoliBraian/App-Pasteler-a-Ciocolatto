"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { updateQuoteStatusSchema } from "@/lib/validations/quote";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

export async function updateQuoteStatusAction(id: string, status: string): Promise<ActionResult> {
  const parsed = updateQuoteStatusSchema.safeParse({ id, status });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  await prisma.quote.update({ where: { id: parsed.data.id }, data: { status: parsed.data.status } });
  revalidatePath("/admin/quotes");
  revalidatePath(`/admin/quotes/${id}`);
  revalidatePath("/admin");
  return { ok: true };
}
