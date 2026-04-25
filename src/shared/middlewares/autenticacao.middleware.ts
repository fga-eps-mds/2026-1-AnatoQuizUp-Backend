import type { Response, Request, NextFunction } from "express";

import { verifyJwtToken } from "../utils/jwt";
import { ErroAplicacao } from "@/shared/errors/erro-aplicacao";
import type { AuthPayload } from "../types/auth.types";
import { STATUS } from "../constants/status";

export const middlewareAutenticacao = (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const authorization_field: string | undefined = request.headers["authorization"];

  if (!authorization_field) {
    throw new ErroAplicacao({
      mensagem: "Nenhum token foi fornecido",
      codigo: "NENHUM_TOKEN_FORNECIDO",
      codigoStatus: 401,
    });
  }

  const token: string = authorization_field.replace("Bearer ", "");

  const payload: AuthPayload = verifyJwtToken(token);

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
