import { Router } from "express";

import { RecuperarSenhaController } from "@/modules/auth/recuperar-senha/recuperar-senha.controller";
import { RecuperarSenhaRepository } from "@/modules/auth/recuperar-senha/recuperar-senha.repository";
import {
  schemaRedefinirSenha,
  schemaSolicitarRecuperacaoSenha,
} from "@/modules/auth/recuperar-senha/recuperar-senha.schemas";
import { RecuperarSenhaService } from "@/modules/auth/recuperar-senha/recuperar-senha.service";
import { validarRequisicao } from "@/shared/middlewares/validacao.middleware";

const recuperarSenhaRepository = new RecuperarSenhaRepository();
const recuperarSenhaService = new RecuperarSenhaService(recuperarSenhaRepository);
const recuperarSenhaController = new RecuperarSenhaController(recuperarSenhaService);

const recuperarSenhaRouter = Router();

recuperarSenhaRouter.post(
  "/forgot-password",
  validarRequisicao(schemaSolicitarRecuperacaoSenha),
  recuperarSenhaController.forgotPassword,
);

recuperarSenhaRouter.post(
  "/reset-password",
  validarRequisicao(schemaRedefinirSenha),
  recuperarSenhaController.resetPassword,
);

export { recuperarSenhaRouter };
