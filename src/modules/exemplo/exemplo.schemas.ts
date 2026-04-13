import { z } from "zod";

export const schemaCriarExemplo = z.object({
  nome: z.string().trim().min(3).max(120),
  descricao: z.string().trim().max(500).optional(),
});

export const schemaListarExemplos = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const schemaBuscarPorIdExemplo = z.object({
  id: z.string().trim().min(1),
});
