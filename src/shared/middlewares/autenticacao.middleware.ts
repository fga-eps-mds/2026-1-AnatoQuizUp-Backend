import type { Response, Request, NextFunction } from "express";

import { verifyJwtToken } from "../utils/jwt";
import { ErroAplicacao } from "@/shared/errors/erro-aplicacao";

export const middlewareAutenticacao = (request: Request, response: Response, next: NextFunction) => {

  const token = request.headers["authorization"];
      
  if(!token){
      throw new ErroAplicacao({
        mensagem: "Nenhum token foi fornecido",
        codigo: "NENHUM_TOKEN_FORNECIDO",
        codigoStatus: 401,
      });
  }

  verifyJwtToken(token);
  next();
};
