import { Router } from "express";

import { alunoAuthRouter } from "@/modules/auth/aluno/aluno.routes";

const authRouter = Router();

authRouter.use("/", alunoAuthRouter);

export { authRouter };
