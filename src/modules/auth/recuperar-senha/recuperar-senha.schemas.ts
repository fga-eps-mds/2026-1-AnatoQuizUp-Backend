import { z } from "zod";

const schemaEmail = z
  .string()
  .trim()
  .max(255)
  .pipe(z.email())
  .transform((email) => email.toLowerCase());

export const schemaSolicitarRecuperacaoSenha = z.object({
  email: schemaEmail,
});

export const schemaRedefinirSenha = z.object({
  token: z.string().trim().min(1),
  senha: z.string().min(8),
});
