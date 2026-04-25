import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";

import { VALOR_NAO_SE_APLICA } from "@/modules/auth/aluno/aluno.constants";
import { schemaRegistrarAluno } from "@/modules/auth/aluno/aluno.schemas";
import { CodigoDeErro } from "@/shared/errors/codigos-de-erro";
import { validarRequisicao } from "@/shared/middlewares/validacao.middleware";

const payloadValido = {
  nome: "Joao da Silva Junior",
  email: "joao@aluno.unb.br",
  senha: "senha1234",
  confirmacaoSenha: "senha1234",
  instituicao: "Universidade de Brasilia",
  curso: "Medicina",
  periodo: "3",
  dataNascimento: "2003-12-30",
  nacionalidade: "Brasileiro",
  estado: "DF",
  cidade: "Brasilia",
  escolaridade: "GRADUACAO",
};

function validarBody(body: unknown) {
  const request = { body } as Request;
  const response = {} as Response;
  const next = vi.fn();
  const middleware = validarRequisicao(schemaRegistrarAluno);

  middleware(request, response, next);

  return next;
}

describe("schemaRegistrarAluno", () => {
  it("normaliza email e estado", () => {
    const resultado = schemaRegistrarAluno.parse({
      ...payloadValido,
      email: "JOAO@ALUNO.UNB.BR",
      estado: "df",
    });

    expect(resultado.email).toBe("joao@aluno.unb.br");
    expect(resultado.estado).toBe("DF");
  });

  it("aceita Nao se aplica para instituicao, curso e periodo", () => {
    const resultado = schemaRegistrarAluno.parse({
      ...payloadValido,
      instituicao: VALOR_NAO_SE_APLICA,
      curso: VALOR_NAO_SE_APLICA,
      periodo: VALOR_NAO_SE_APLICA,
    });

    expect(resultado.instituicao).toBe(VALOR_NAO_SE_APLICA);
    expect(resultado.curso).toBe(VALOR_NAO_SE_APLICA);
    expect(resultado.periodo).toBe(VALOR_NAO_SE_APLICA);
  });

  it.each([
    ["senha menor que 8 caracteres", { senha: "1234567", confirmacaoSenha: "1234567" }],
    ["confirmacao de senha diferente", { confirmacaoSenha: "outrasenha" }],
    ["email invalido", { email: "email-invalido" }],
    ["nome vazio", { nome: "   " }],
    ["data de nascimento ausente", { dataNascimento: undefined }],
    ["data de nascimento invalida", { dataNascimento: "30/12/2003" }],
    ["nacionalidade ausente", { nacionalidade: undefined }],
    ["estado fora da lista", { estado: "XX" }],
    ["cidade vazia", { cidade: "   " }],
    ["escolaridade fora das opcoes", { escolaridade: "MESTRADO" }],
    ["instituicao ausente", { instituicao: undefined }],
    ["curso ausente", { curso: undefined }],
    ["periodo ausente", { periodo: undefined }],
  ])("retorna erro 400 para %s", (_caso, alteracao) => {
    const next = validarBody({
      ...payloadValido,
      ...alteracao,
    });

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        codigoStatus: 400,
        codigo: CodigoDeErro.ERRO_DE_VALIDACAO,
      }),
    );
  });
});
