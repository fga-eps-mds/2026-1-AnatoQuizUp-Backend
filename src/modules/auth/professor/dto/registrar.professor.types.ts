import type { z } from "zod";

import type { schemaRegistrarProfessor } from "@/modules/auth/professor/professor.schemas";

export type RegistrarProfessorDto = z.infer<typeof schemaRegistrarProfessor>;
