import { Router } from "express";

import { alunoAuthRouter } from "@/modules/auth/aluno/aluno.routes";
import { alunoLocalidadesRouter } from "@/modules/auth/aluno/localidades/localidades.routes";
import { recuperarSenhaRouter } from "@/modules/auth/recuperar-senha/recuperar-senha.routes";

const authRouter = Router();

authRouter.use("/", alunoAuthRouter);
authRouter.use("/", recuperarSenhaRouter);
authRouter.use("/localidades", alunoLocalidadesRouter);
authRouter.use("/alunos/localidades", alunoLocalidadesRouter);

export { authRouter };
