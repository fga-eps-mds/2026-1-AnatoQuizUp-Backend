import { Router } from "express";

import { AlunoOpcoesAcademicasController } from "@/modules/auth/aluno/opcoes-academicas/opcoes-academicas.controller";
import { AlunoOpcoesAcademicasService } from "@/modules/auth/aluno/opcoes-academicas/opcoes-academicas.service";

const opcoesAcademicasService = new AlunoOpcoesAcademicasService();
const opcoesAcademicasController = new AlunoOpcoesAcademicasController(opcoesAcademicasService);

const alunoOpcoesAcademicasRouter = Router();

alunoOpcoesAcademicasRouter.get("/", opcoesAcademicasController.listarOpcoesAcademicas);

export { alunoOpcoesAcademicasRouter };

