import type { Request, Response } from "express";

import {
  schemaRedefinirSenha,
  schemaSolicitarRecuperacaoSenha,
} from "@/modules/auth/recuperar-senha/recuperar-senha.schemas";
import { CodigoDeErro } from "@/shared/errors/codigos-de-erro";
import { validarRequisicao } from "@/shared/middlewares/validacao.middleware";

function validarBody(schema: typeof schemaSolicitarRecuperacaoSenha | typeof schemaRedefinirSenha, body: unknown) {
  const request = { body } as Request;
  const response = {} as Response;
  const next = jest.fn();
  const middleware = validarRequisicao(schema);

  middleware(request, response, next);

  return next;
}

describe("schemas de recuperacao de senha", () => {
  it("normaliza email ao solicitar recuperacao", () => {
    expect(schemaSolicitarRecuperacaoSenha.parse({ email: " ALUNO@EXAMPLE.COM " })).toEqual({
      email: "aluno@example.com",
    });
  });

  it("aceita token e senha validos para redefinicao", () => {
    expect(
      schemaRedefinirSenha.parse({
        token: " reset-token ",
        senha: "novaSenha123",
      }),
    ).toEqual({
      token: "reset-token",
      senha: "novaSenha123",
    });
  });

  it.each([
    ["email ausente", schemaSolicitarRecuperacaoSenha, {}],
    ["email invalido", schemaSolicitarRecuperacaoSenha, { email: "email-invalido" }],
    ["token ausente", schemaRedefinirSenha, { senha: "novaSenha123" }],
    ["token vazio", schemaRedefinirSenha, { token: "   ", senha: "novaSenha123" }],
    ["senha ausente", schemaRedefinirSenha, { token: "reset-token" }],
    ["senha menor que 8 caracteres", schemaRedefinirSenha, { token: "reset-token", senha: "1234567" }],
  ])("retorna erro 400 para %s", (_caso, schema, body) => {
    const next = validarBody(schema, body);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        codigoStatus: 400,
        codigo: CodigoDeErro.ERRO_DE_VALIDACAO,
      }),
    );
  });
});
