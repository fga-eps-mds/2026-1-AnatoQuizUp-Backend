import { z } from "zod";

const FORMATO_EMAIL_UNB = /.+@(.+\.)?unb\.br$/i;
const FORMATO_SIAPE = /^\d{7}$/;

function textoObrigatorio(max: number) {
  return z.string().trim().min(1).max(max);
}

export const schemaEmailProfessor = z
  .string()
  .trim()
  .max(255)
  .pipe(z.email())
  .transform((email) => email.toLowerCase())
  .refine((email) => FORMATO_EMAIL_UNB.test(email), {
    message: "Email institucional UnB obrigatorio.",
  });

export const schemaSiapeProfessor = z.string().trim().regex(FORMATO_SIAPE, {
  message: "SIAPE invalido.",
});

export const schemaRegistrarProfessor = z
  .object({
    nome: textoObrigatorio(120),
    email: schemaEmailProfessor,
    siape: schemaSiapeProfessor,
    instituicao: z
      .string()
      .trim()
      .refine((instituicao) => instituicao === "UnB", {
        message: "Instituicao deve ser UnB.",
      }),
    departamento: textoObrigatorio(120),
    curso: textoObrigatorio(120),
    senha: z.string().min(8),
    confirmacaoSenha: z.string().min(8),
  })
  .refine((data) => data.senha === data.confirmacaoSenha, {
    message: "Confirmacao de senha deve ser igual a senha.",
    path: ["confirmacaoSenha"],
  });
