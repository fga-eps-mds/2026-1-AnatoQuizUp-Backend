import type { RequestHandler } from "express";

import { MENSAGENS } from "@/shared/constants/mensagens";
import { CodigoDeErro } from "@/shared/errors/codigos-de-erro";
import { ErroAplicacao } from "@/shared/errors/erro-aplicacao";

export const middlewareAutenticacao: RequestHandler = (_request, _response, next) => {
  next(
    new ErroAplicacao({
      codigoStatus: 501,
      codigo: CodigoDeErro.NAO_IMPLEMENTADO,
      mensagem: MENSAGENS.autenticacaoNaoImplementada,
    }),
  );
};
