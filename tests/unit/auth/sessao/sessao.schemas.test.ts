import type { Request, Response } from "express";

import { schemaLogin } from "@/modules/auth/sessao/sessao.schemas";
import { CodigoDeErro } from "@/shared/errors/codigos-de-erro";
import { validarRequisicao } from "@/shared/middlewares/validacao.middleware";

function validarBody(body: unknown) {
  const request = { body } as Request;
  const response = {} as Response;
  const next = jest.fn();
  const middleware = validarRequisicao(schemaLogin);

  middleware(request, response, next);

  return { request, next };
}

describe("schemaLogin", () => {
  it("normaliza email e preserva senha", () => {
    const resultado = schemaLogin.parse({
      email: " JOAO@ALUNO.UNB.BR ",
      senha: "senha1234",
    });

    expect(resultado).toEqual({
      email: "joao@aluno.unb.br",
      senha: "senha1234",
    });
  });

  it.each([
    ["email ausente", { senha: "senha1234" }],
    ["email invalido", { email: "email-invalido", senha: "senha1234" }],
    ["senha ausente", { email: "joao@aluno.unb.br" }],
    ["senha vazia", { email: "joao@aluno.unb.br", senha: "" }],
  ])("retorna erro 400 para %s", (_caso, body) => {
    const { next } = validarBody(body);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        codigoStatus: 400,
        codigo: CodigoDeErro.ERRO_DE_VALIDACAO,
      }),
    );
  });
});
