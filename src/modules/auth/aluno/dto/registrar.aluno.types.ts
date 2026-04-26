import type { z } from "zod";

import type {
  schemaDisponibilidadeNicknameAluno,
  schemaRegistrarAluno,
} from "@/modules/auth/aluno/aluno.schemas";

export type RegistrarAlunoDto = z.infer<typeof schemaRegistrarAluno>;
export type DisponibilidadeNicknameAlunoDto = z.infer<typeof schemaDisponibilidadeNicknameAluno>;
