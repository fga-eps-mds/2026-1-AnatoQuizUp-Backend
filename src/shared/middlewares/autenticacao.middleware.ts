import type { Response, Request, NextFunction } from "express";

import { verificarTokenJwt } from "../utils/jwt";
import { ErroAplicacao } from "@/shared/errors/erro-aplicacao";
import type { PayloadAutenticacao } from "../types/autenticacao.types";
import { STATUS } from "../constants/status";

export const middlewareAutenticacao = (
  request: Request,
  response: Response,
  next: NextFunction,
) => {

  const rotas_publicas = ["/login", '/register', 'forgot-password', 'reset-password', 'refresh', '/'];
  if (rotas_publicas.includes(request.path)) {
    return next();
  }

  const campo_authorization: string | undefined = request.headers["authorization"];

  if (!campo_authorization) {
    throw new ErroAplicacao({
      mensagem: "Nenhum token foi fornecido",
      codigo: "NENHUM_TOKEN_FORNECIDO",
      codigoStatus: 401,
    });
  }

  if (!campo_authorization.startsWith("Bearer ")) {
    throw new ErroAplicacao({
      mensagem: "Token inválido",
      codigo: "TOKEN_INVALIDO",
      codigoStatus: 401,
    });
  }

  const token: string = campo_authorization.replace("Bearer ", "");

  const payload: PayloadAutenticacao = verificarTokenJwt(token);

  if (payload.status != STATUS.ATIVO) {
    if (payload.status == STATUS.INATIVO) {
      throw new ErroAplicacao({
        mensagem: "Conta desativada",
        codigo: "CONTA_DESATIVADA",
        codigoStatus: 403,
      });
    } else if (payload.status == STATUS.PENDENTE) {
      throw new ErroAplicacao({
        mensagem: "Cadastro em análise",
        codigo: "CADASTRO_EM_ANALISE",
        codigoStatus: 403,
      });
    } else {
      throw new ErroAplicacao({
        mensagem: "Cadastro recusado",
        codigo: "CADASTRO_RECUSADO",
        codigoStatus: 403,
      });
    }
  }

  next();
};
