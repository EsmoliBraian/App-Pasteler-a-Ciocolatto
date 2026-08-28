import { z } from "zod";

export const purchaseUnitEnum = z.enum(["KILOGRAM", "GRAM", "LITER", "MILLILITER", "UNIT"]);

export const ingredientSchema = z.object({
  name: z.string().trim().min(2, "El nombre es muy corto").max(80),
  category: z.string().trim().max(60).optional().or(z.literal("")),
  purchaseUnit: purchaseUnitEnum,
  // "Costo": costo de 1 unidad de purchaseUnit.
  purchasePrice: z.coerce.number().nonnegative("No puede ser negativo"),
  trackStock: z.coerce.boolean().default(false),
  stockQuantity: z.coerce.number().nonnegative().optional(),
  // Proveedor: uno de los dos (elegir existente o cargar uno nuevo), ambos opcionales.
  providerId: z.string().trim().optional().or(z.literal("")),
  newProviderName: z.string().trim().max(100).optional().or(z.literal("")),
  active: z.coerce.boolean().default(true),
});

export type IngredientInput = z.infer<typeof ingredientSchema>;
