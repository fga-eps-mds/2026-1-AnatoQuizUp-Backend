import { Router } from "express";

import { ProfessorAuthController } from "@/modules/auth/professor/professor.controller";
import { ProfessorAuthRepository } from "@/modules/auth/professor/professor.repository";
import { schemaRegistrarProfessor } from "@/modules/auth/professor/professor.schemas";
import { ProfessorAuthService } from "@/modules/auth/professor/professor.service";
import { validarRequisicao } from "@/shared/middlewares/validacao.middleware";

const professorAuthRepository = new ProfessorAuthRepository();
const professorAuthService = new ProfessorAuthService(professorAuthRepository);
const professorAuthController = new ProfessorAuthController(professorAuthService);

const professorAuthRouter = Router();

professorAuthRouter.post(
  "/cadastro/professor",
  validarRequisicao(schemaRegistrarProfessor),
  professorAuthController.registrar,
);

export { professorAuthRouter };
