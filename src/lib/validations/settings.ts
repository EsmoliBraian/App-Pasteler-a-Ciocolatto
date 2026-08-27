import { z } from "zod";

export const generalSettingsSchema = z.object({
  businessName: z.string().trim().min(2).max(100),
  logoUrl: z.string().trim().url().optional().or(z.literal("")),
  contactInfo: z.string().trim().max(300).optional().or(z.literal("")),
});

export const whatsappSettingsSchema = z.object({
  whatsappNumber: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{6,20}$/, "Número inválido, usá formato internacional (+549...)"),
  whatsappGreeting: z.string().trim().min(5).max(500),
});

export const pricingSettingsSchema = z.object({
  defaultMarginPercent: z.coerce.number().min(0).max(400),
  marginMethod: z.enum(["COST_PLUS", "MARGIN_ON_PRICE"]),
  roundingIncrement: z.coerce.number().int().min(0),
});

export const builderSettingsSchema = z.object({
  maxFillings: z.coerce.number().int().min(1).max(6),
});
