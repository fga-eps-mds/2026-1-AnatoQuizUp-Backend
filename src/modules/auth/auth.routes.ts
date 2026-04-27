import { Router } from "express";

import { alunoAuthRouter } from "@/modules/auth/aluno/aluno.routes";
import { alunoLocalidadesRouter } from "@/modules/auth/aluno/localidades/localidades.routes";

const authRouter = Router();

authRouter.use("/", alunoAuthRouter);
authRouter.use("/localidades", alunoLocalidadesRouter);
authRouter.use("/alunos/localidades", alunoLocalidadesRouter);

export { authRouter };
