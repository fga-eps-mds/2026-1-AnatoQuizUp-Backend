import { Router } from "express";

import { AlunoNacionalidadesController } from "@/modules/auth/aluno/nacionalidades/nacionalidades.controller";
import { AlunoNacionalidadesService } from "@/modules/auth/aluno/nacionalidades/nacionalidades.service";

const nacionalidadesService = new AlunoNacionalidadesService();
const nacionalidadesController = new AlunoNacionalidadesController(nacionalidadesService);

const alunoNacionalidadesRouter = Router();

alunoNacionalidadesRouter.get("/", nacionalidadesController.listarNacionalidades);

export { alunoNacionalidadesRouter };

