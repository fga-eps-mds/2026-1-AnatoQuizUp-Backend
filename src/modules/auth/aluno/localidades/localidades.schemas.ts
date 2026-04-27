import { z } from "zod";

import { ESTADOS_BRASILEIROS } from "@/shared/constants/localidades";

export const schemaBuscarCidadesPorUf = z.object({
  uf: z
    .string()
    .trim()
    .transform((uf) => uf.toUpperCase())
    .pipe(z.enum(ESTADOS_BRASILEIROS)),
});

export type BuscarCidadesPorUfDto = z.infer<typeof schemaBuscarCidadesPorUf>;