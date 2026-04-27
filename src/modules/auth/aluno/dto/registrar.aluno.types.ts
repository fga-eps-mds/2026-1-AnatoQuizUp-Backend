import type { z } from "zod";

import type {
  schemaDisponibilidadeEmailAluno,
  schemaDisponibilidadeNicknameAluno,
  schemaRegistrarAluno,
} from "@/modules/auth/aluno/aluno.schemas";

export type RegistrarAlunoDto = z.infer<typeof schemaRegistrarAluno>;
export type DisponibilidadeNicknameAlunoDto = z.infer<typeof schemaDisponibilidadeNicknameAluno>;
export type DisponibilidadeEmailAlunoDto = z.infer<typeof schemaDisponibilidadeEmailAluno>;