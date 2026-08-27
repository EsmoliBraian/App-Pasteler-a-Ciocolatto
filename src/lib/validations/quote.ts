import { z } from "zod";

export const createQuoteSchema = z
  .object({
    spongeId: z.string().min(1, "Elegí un bizcochuelo"),
    fillingIds: z.array(z.string().min(1)).min(1, "Elegí al menos un relleno").max(6),
    decorationId: z.string().min(1, "Elegí una decoración"),
    customDescription: z.string().trim().max(1000).optional(),
    customerName: z.string().trim().max(120).optional(),
    customerPhone: z.string().trim().max(30).optional(),
  })
  .refine((data) => data.fillingIds.length === new Set(data.fillingIds).size, {
    message: "No repitas el mismo relleno",
    path: ["fillingIds"],
  });

export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;

export const updateQuoteStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["PENDING", "CONTACTED", "CONFIRMED", "REJECTED", "COMPLETED"]),
});
