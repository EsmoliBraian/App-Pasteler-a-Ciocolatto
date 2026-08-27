import { z } from "zod";

export const purchaseUnitEnum = z.enum(["KILOGRAM", "GRAM", "LITER", "MILLILITER", "UNIT"]);

export const ingredientSchema = z.object({
  name: z.string().trim().min(2, "El nombre es muy corto").max(80),
  supplier: z.string().trim().max(120).optional().or(z.literal("")),
  purchaseUnit: purchaseUnitEnum,
  purchaseQuantity: z.coerce.number().positive("Debe ser mayor a 0"),
  purchasePrice: z.coerce.number().nonnegative("No puede ser negativo"),
  active: z.coerce.boolean().default(true),
});

export type IngredientInput = z.infer<typeof ingredientSchema>;
