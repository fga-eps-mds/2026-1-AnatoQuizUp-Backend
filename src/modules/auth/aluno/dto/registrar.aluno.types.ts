import type { z } from "zod";

import type { schemaRegistrarAluno } from "@/modules/auth/aluno/aluno.schemas";

export type RegistrarAlunoDto = z.infer<typeof schemaRegistrarAluno>;
