import { z } from "zod";
import { STATUS_USUARIO_API } from "./dto/alterar.status_user.types";

export const schemaListarUsers = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const schemaBuscarUserPorId = z.object({
  id: z.string().trim().min(1),
});

export const schemaAlterarStatusUser = z.object({
  status: z.enum([
    STATUS_USUARIO_API.PENDING,
    STATUS_USUARIO_API.ACTIVE,
    STATUS_USUARIO_API.INACTIVE,
  ]),
});
