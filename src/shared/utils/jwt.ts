import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

import { AuthPayload } from "../types/auth.types";
import { jwtSecretKey, jwtRefreshSecretKey } from "../../config/env";
import { ErroAplicacao } from "../errors/erro-aplicacao";

export const verifyJwtToken = (token: string, secret: string = jwtSecretKey) => {
    try{
        const payload: AuthPayload = jwt.verify(token, secret) as AuthPayload;
        return payload;
    }
    catch (error: unknown) {
        if (error instanceof TokenExpiredError) {
            throw new ErroAplicacao({
                mensagem: "Token expirado",
                codigo: "TOKEN_EXPIRADO",
                codigoStatus: 401,
                detalhes: error,
            });
        } else if (error instanceof JsonWebTokenError) {
            throw new ErroAplicacao({
                mensagem: "Token inválido",
                codigo: "TOKEN_INVALIDO",
                codigoStatus: 401,
                detalhes: error,
            });
        } else {
            throw new ErroAplicacao({
                mensagem: "Falha na verificação do token",
                codigo: "VERIFICACAO_TOKEN_FALHOU",
                codigoStatus: 401,
                detalhes: error,
            });
        }
    }
}

export const generateAccessToken = (payload: AuthPayload, secret: string = jwtSecretKey) => {
    return jwt.sign(payload, secret, { expiresIn: '1h' });
}

export const generateRefreshToken = (payload: AuthPayload, secret: string = jwtRefreshSecretKey) => {
    return jwt.sign(payload, secret, { expiresIn: '7 days' });
}

export const generatePasswordRedefinitionToken = (payload: AuthPayload, secret: string = jwtSecretKey) => {
    return jwt.sign(payload, secret, { expiresIn: '15m' });
}