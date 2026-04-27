import { z } from "zod";

export const schemaListarUsers = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const schemaBuscarUserPorId = z.object({
  id: z.string().trim().min(1),
});
