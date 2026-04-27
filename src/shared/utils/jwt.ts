import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

import type { PayloadAutenticacao } from "../types/autenticacao.types";
import { jwtSecretKey, jwtRefreshSecretKey } from "../../config/env";
import { ErroAplicacao } from "../errors/erro-aplicacao";

export const verificarTokenJwt = (token: string, segredo: string = jwtSecretKey) => {
  try {
    const payload: PayloadAutenticacao = jwt.verify(token, segredo) as PayloadAutenticacao;
    return payload;
  } catch (erro: unknown) {
    if (erro instanceof TokenExpiredError) {
      throw new ErroAplicacao({
        mensagem: "Token expirado",
        codigo: "TOKEN_EXPIRADO",
        codigoStatus: 401,
        detalhes: erro,
      });
    } else if (erro instanceof JsonWebTokenError) {
      throw new ErroAplicacao({
        mensagem: "Token inválido",
        codigo: "TOKEN_INVALIDO",
        codigoStatus: 401,
        detalhes: erro,
      });
    } else {
      throw new ErroAplicacao({
        mensagem: "Falha na verificação do token",
        codigo: "VERIFICACAO_TOKEN_FALHOU",
        codigoStatus: 401,
        detalhes: erro,
      });
    }
  }
};

export const gerarTokenDeAcesso = (
  payload: PayloadAutenticacao,
  segredo: string = jwtSecretKey,
) => {
  return jwt.sign(payload, segredo, { expiresIn: "1h" });
};

export const gerarRefreshToken = (
  payload: PayloadAutenticacao,
  segredo: string = jwtRefreshSecretKey,
) => {
  return jwt.sign(payload, segredo, { expiresIn: "7 days" });
};

export const gerarTokenDeRedefinicaoDeSenha = (
  payload: PayloadAutenticacao,
  segredo: string = jwtSecretKey,
) => {
  return jwt.sign(payload, segredo, { expiresIn: "15m" });
};
