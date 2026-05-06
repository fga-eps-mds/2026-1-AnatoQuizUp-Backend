import type { NextFunction, Request, Response } from "express";

import { prisma } from "@/config/db";
import { PAPEIS } from "@/shared/constants/papeis";
import type { Papel } from "@/shared/constants/papeis";
import { STATUS } from "@/shared/constants/status";
import { CodigoDeErro } from "@/shared/errors/codigos-de-erro";
import { ErroAplicacao } from "@/shared/errors/erro-aplicacao";
import type { PayloadAutenticacao } from "@/shared/types/autenticacao.types";
import { verificarTokenJwt } from "@/shared/utils/jwt";

const ROTAS_PUBLICAS = new Set([
  "/autenticacao/cadastro",
  "/autenticacao/login",
  "/autenticacao/recuperar-senha",
  "/autenticacao/redefinir-senha",
  "/autenticacao/atualizar-token",
  "/cadastro",
  "/login",
  "/redefinir-senha",
  "/recuperar-senha",
  "/atualizar-token",
]);

function normalizarCaminho(caminho: string | undefined): string {
  if (!caminho) {
    return "";
  }

  const caminhoSemQuery = caminho.split("?")[0] ?? "";

  if (caminhoSemQuery.startsWith("/api/v1")) {
    return caminhoSemQuery.slice("/api/v1".length) || "/";
  }

  return caminhoSemQuery;
}

function ehRotaPublica(request: Request): boolean {
  const caminhos = [
    normalizarCaminho(request.path),
    normalizarCaminho(request.originalUrl),
    normalizarCaminho(request.url),
  ];

  return caminhos.some((caminho) => ROTAS_PUBLICAS.has(caminho));
}

function converterPerfilParaPapel(perfil: string): Papel {
  if (perfil === "ADMIN") {
    return PAPEIS.ADMINISTRADOR;
  }

  return perfil as Papel;
}

function obterTokenDoCabecalho(request: Request): string {
  const campoAuthorization = request.headers.authorization;

  if (!campoAuthorization) {
    throw new ErroAplicacao({
      mensagem: "Token não fornecido",
      codigo: CodigoDeErro.NENHUM_TOKEN_FORNECIDO,
      codigoStatus: 401,
    });
  }

  if (!campoAuthorization.startsWith("Bearer ")) {
    throw new ErroAplicacao({
      mensagem: "Token inválido",
      codigo: CodigoDeErro.TOKEN_INVALIDO,
      codigoStatus: 401,
    });
  }

  return campoAuthorization.replace("Bearer ", "");
}

function validarStatusUsuario(status: string): void {
  if (status === STATUS.ATIVO) {
    return;
  }

  if (status === STATUS.PENDENTE) {
    throw new ErroAplicacao({
      mensagem: "Cadastro em análise",
      codigo: CodigoDeErro.CADASTRO_EM_ANALISE,
      codigoStatus: 403,
    });
  }

  if (status === STATUS.INATIVO) {
    throw new ErroAplicacao({
      mensagem: "Conta desativada",
      codigo: CodigoDeErro.CONTA_DESATIVADA,
      codigoStatus: 403,
    });
  }

  throw new ErroAplicacao({
    mensagem: "Cadastro recusado",
    codigo: CodigoDeErro.CADASTRO_RECUSADO,
    codigoStatus: 403,
  });
}

export async function middlewareAutenticacao(
  request: Request,
  _response: Response,
  next: NextFunction,
) {
  if (ehRotaPublica(request)) {
    return next();
  }

  const token = obterTokenDoCabecalho(request);
  const payload: PayloadAutenticacao = verificarTokenJwt(token);

  const usuario = await prisma.usuario.findUnique({
    where: { id: payload.id },
    select: {
      id: true,
      email: true,
      perfil: true,
      status: true,
      excluidoEm: true,
    },
  });

  if (!usuario || usuario.excluidoEm) {
    throw new ErroAplicacao({
      mensagem: "Token inválido",
      codigo: CodigoDeErro.TOKEN_INVALIDO,
      codigoStatus: 401,
    });
  }

  validarStatusUsuario(usuario.status);

  const papel = converterPerfilParaPapel(usuario.perfil);

  request.usuario = {
    id: usuario.id,
    email: usuario.email,
    papel,
  };

  request.user = {
    userId: usuario.id,
    email: usuario.email,
    role: papel,
  };

  return next();
}
