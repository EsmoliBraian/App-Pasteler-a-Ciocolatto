import { z } from "zod";

export const sizeSchema = z.object({
  name: z.string().trim().min(2, "El nombre es muy corto").max(80),
  // Porcentaje del costo de insumos de la receta base (100 = costo completo).
  percent: z.coerce.number().positive("Debe ser mayor a 0").max(500),
  active: z.coerce.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

export type SizeInput = z.infer<typeof sizeSchema>;
