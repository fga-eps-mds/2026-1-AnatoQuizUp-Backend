import { Router } from "express";

import { AlunoAuthController } from "@/modules/auth/aluno/aluno.controller";
import { AlunoAuthRepository } from "@/modules/auth/aluno/aluno.repository";
import {
  schemaDisponibilidadeNicknameAluno,
  schemaRegistrarAluno,
} from "@/modules/auth/aluno/aluno.schemas";
import { AlunoAuthService } from "@/modules/auth/aluno/aluno.service";
import { validarRequisicao } from "@/shared/middlewares/validacao.middleware";

const alunoAuthRepository = new AlunoAuthRepository();
const alunoAuthService = new AlunoAuthService(alunoAuthRepository);
const alunoAuthController = new AlunoAuthController(alunoAuthService);

const alunoAuthRouter = Router();

alunoAuthRouter.get(
  "/alunos/nickname-disponivel",
  validarRequisicao(schemaDisponibilidadeNicknameAluno, "query"),
  alunoAuthController.verificarNicknameDisponivel,
);

alunoAuthRouter.post(
  "/register",
  validarRequisicao(schemaRegistrarAluno),
  alunoAuthController.registrar,
);

export { alunoAuthRouter };
