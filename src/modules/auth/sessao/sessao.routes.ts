import { Router } from "express";

import { SessaoController } from "@/modules/auth/sessao/sessao.controller";
import { SessaoRepository } from "@/modules/auth/sessao/sessao.repository";
import { schemaLogin, schemaRefreshToken } from "@/modules/auth/sessao/sessao.schemas";
import { SessaoService } from "@/modules/auth/sessao/sessao.service";
import { middlewareAutenticacao } from "@/shared/middlewares/autenticacao.middleware";
import { validarRequisicao } from "@/shared/middlewares/validacao.middleware";

const sessaoRepository = new SessaoRepository();
const sessaoService = new SessaoService(sessaoRepository);
const sessaoController = new SessaoController(sessaoService);

const sessaoRouter = Router();

sessaoRouter.post("/login", validarRequisicao(schemaLogin), sessaoController.login);
sessaoRouter.post(
  "/refresh",
  validarRequisicao(schemaRefreshToken),
  sessaoController.renovarSessao,
);
sessaoRouter.get("/me", middlewareAutenticacao, sessaoController.obterUsuarioAutenticado);

export { sessaoRouter };
