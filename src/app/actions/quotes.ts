"use server";

import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { getProductWithBreakdownById } from "@/lib/products";
import { buildWhatsappLink, buildWhatsappMessage } from "@/lib/whatsapp";
import { createQuoteSchema, type CreateQuoteInput } from "@/lib/validations/quote";

export interface CreateQuoteResult {
  ok: boolean;
  error?: string;
  quoteId?: string;
  whatsappUrl?: string;
}

export async function createQuoteAction(input: CreateQuoteInput): Promise<CreateQuoteResult> {
  const parsed = createQuoteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const data = parsed.data;

  const settings = await getSettings();
  if (data.fillingIds.length > settings.maxFillings) {
    return { ok: false, error: `Podés elegir hasta ${settings.maxFillings} rellenos` };
  }

  const sponge = await getProductWithBreakdownById(data.spongeId);
  if (!sponge || sponge.type !== "SPONGE" || sponge.price === null) {
    return { ok: false, error: "El bizcochuelo elegido no está disponible" };
  }

  const fillings = await Promise.all(data.fillingIds.map((id) => getProductWithBreakdownById(id)));
  if (fillings.some((f) => !f || f.type !== "FILLING" || f.price === null)) {
    return { ok: false, error: "Alguno de los rellenos elegidos no está disponible" };
  }
  const validFillings = fillings as NonNullable<(typeof fillings)[number]>[];

  const decoration = await getProductWithBreakdownById(data.decorationId);
  if (!decoration || decoration.type !== "DECORATION") {
    return { ok: false, error: "La decoración elegida no está disponible" };
  }

  const isCustomDecoration = decoration.isCustom;
  if (isCustomDecoration && !data.customDescription) {
    return { ok: false, error: "Contanos cómo imaginás tu torta" };
  }

  const subtotal =
    sponge.price + validFillings.reduce((sum, f) => sum + (f.price ?? 0), 0) + (decoration.price ?? 0);
  const total = isCustomDecoration ? null : subtotal;

  const quote = await prisma.quote.create({
    data: {
      customerName: data.customerName || null,
      customerPhone: data.customerPhone || null,
      isCustomDecoration,
      customDescription: isCustomDecoration ? data.customDescription : null,
      subtotal: isCustomDecoration ? null : subtotal,
      total,
      items: {
        create: [
          { type: "SPONGE", productId: sponge.id, name: sponge.name, unitPrice: sponge.price },
          ...validFillings.map((f) => ({
            type: "FILLING" as const,
            productId: f.id,
            name: f.name,
            unitPrice: f.price,
          })),
          {
            type: "DECORATION",
            productId: decoration.id,
            name: decoration.name,
            unitPrice: isCustomDecoration ? null : decoration.price,
          },
        ],
      },
    },
  });

  const message = buildWhatsappMessage({
    greeting: settings.whatsappGreeting,
    spongeName: sponge.name,
    spongePrice: sponge.price,
    fillings: validFillings.map((f) => ({ name: f.name, price: f.price ?? 0 })),
    isCustomDecoration,
    decorationName: decoration.name,
    decorationPrice: decoration.price ?? 0,
    customDescription: data.customDescription,
    total,
  });

  const whatsappUrl = buildWhatsappLink(settings.whatsappNumber, message);

  return { ok: true, quoteId: quote.id, whatsappUrl };
}
