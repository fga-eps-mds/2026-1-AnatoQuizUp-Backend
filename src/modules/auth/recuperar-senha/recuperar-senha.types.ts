import type { z } from "zod";

import type {
  schemaRedefinirSenha,
  schemaSolicitarRecuperacaoSenha,
} from "@/modules/auth/recuperar-senha/recuperar-senha.schemas";

export type SolicitarRecuperacaoSenhaDto = z.infer<typeof schemaSolicitarRecuperacaoSenha>;
export type RedefinirSenhaDto = z.infer<typeof schemaRedefinirSenha>;
