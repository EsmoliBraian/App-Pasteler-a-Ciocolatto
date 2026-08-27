import { z } from "zod";

export const productTypeEnum = z.enum(["SPONGE", "FILLING", "DECORATION"]);
export const decorationCategoryEnum = z.enum(["CLASSIC", "SPECIAL", "FRUIT", "CUSTOM"]);

export const recipeIngredientSchema = z.object({
  ingredientId: z.string().min(1),
  quantity: z.coerce.number().positive("Debe ser mayor a 0"),
});

export const productSchema = z.object({
  type: productTypeEnum,
  name: z.string().trim().min(2, "El nombre es muy corto").max(80),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  colorHex: z
    .string()
    .trim()
    .regex(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/, "Color inválido")
    .optional()
    .or(z.literal("")),
  visualStyle: z.string().trim().max(40).optional().or(z.literal("")),
  imageUrl: z.string().trim().url("URL inválida").optional().or(z.literal("")),
  decorationCategory: decorationCategoryEnum.optional(),
  isCustom: z.coerce.boolean().default(false),
  marginPercent: z.coerce.number().min(0).max(400).optional(),
  active: z.coerce.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
  ingredients: z.array(recipeIngredientSchema).default([]),
});

export type ProductInput = z.infer<typeof productSchema>;
