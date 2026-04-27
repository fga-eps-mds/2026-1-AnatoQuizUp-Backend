import cors from "cors";
import express, { Router } from "express";
import helmet from "helmet";

import { criarOpcoesCors } from "@/config/cors";
import { env } from "@/config/env";
import { loggerHttp } from "@/config/logger";
import { authRouter } from "@/modules/auth";
import { exemploRouter } from "@/modules/exemplo";
import { MENSAGENS } from "@/shared/constants/mensagens";
import { ErroAplicacao } from "@/shared/errors/erro-aplicacao";
import { CodigoDeErro } from "@/shared/errors/codigos-de-erro";
import { middlewareAutenticacao } from "@/shared/middlewares/autenticacao.middleware";
import { middlewareTratamentoErros } from "@/shared/middlewares/tratamento-erros.middleware";

const aplicacao = express();
const roteadorApi = Router();

aplicacao.use(loggerHttp);
aplicacao.use(helmet());
aplicacao.use(cors(criarOpcoesCors(env.CORS_ORIGINS)));
aplicacao.use(express.json());

aplicacao.get("/health", (_request, response) => {
  return response.status(200).json({
    mensagem: MENSAGENS.apiEmExecucao,
    dados: {
      status: "ok",
      timestamp: new Date().toISOString(),
    },
  });
});

roteadorApi.use("/auth", authRouter);
roteadorApi.use(middlewareAutenticacao);
roteadorApi.use("/exemplos", exemploRouter);
aplicacao.use("/api/v1", roteadorApi);
aplicacao.use("/api/auth", authRouter);

aplicacao.use((_request, _response, next) => {
  next(
    new ErroAplicacao({
      codigoStatus: 404,
      codigo: CodigoDeErro.NAO_ENCONTRADO,
      mensagem: MENSAGENS.rotaNaoEncontrada,
    }),
  );
});

aplicacao.use(middlewareTratamentoErros);

export { aplicacao };