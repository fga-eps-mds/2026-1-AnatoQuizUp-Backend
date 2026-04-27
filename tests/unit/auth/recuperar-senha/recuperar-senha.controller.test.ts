import type { Request, Response } from "express";

import { RecuperarSenhaController } from "@/modules/auth/recuperar-senha/recuperar-senha.controller";
import type { RecuperarSenhaService } from "@/modules/auth/recuperar-senha/recuperar-senha.service";
import type {
  RedefinirSenhaDto,
  SolicitarRecuperacaoSenhaDto,
} from "@/modules/auth/recuperar-senha/recuperar-senha.types";
import { MENSAGENS } from "@/shared/constants/mensagens";
import type { RespostaApiSucesso } from "@/shared/types/api.types";

describe("RecuperarSenhaController", () => {
  it("retorna mensagem generica ao solicitar recuperacao de senha", async () => {
    const body: SolicitarRecuperacaoSenhaDto = {
      email: "aluno@example.com",
    };
    const forgotPassword = jest.fn<RecuperarSenhaService["forgotPassword"]>(
      async () => undefined,
    );
    const controller = new RecuperarSenhaController({
      forgotPassword,
    } as unknown as RecuperarSenhaService);
    const request = { body } as Request<unknown, unknown, SolicitarRecuperacaoSenhaDto>;
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const response = { status } as unknown as Response<RespostaApiSucesso<null>>;
    const next = jest.fn();

    await controller.forgotPassword(request, response, next);

    expect(forgotPassword).toHaveBeenCalledWith(body);
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      mensagem: MENSAGENS.instrucoesRecuperacaoSenhaEnviadas,
      dados: null,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("retorna sucesso ao redefinir senha", async () => {
    const body: RedefinirSenhaDto = {
      token: "reset-token",
      senha: "novaSenha123",
    };
    const resetPassword = jest.fn<RecuperarSenhaService["resetPassword"]>(
      async () => undefined,
    );
    const controller = new RecuperarSenhaController({
      resetPassword,
    } as unknown as RecuperarSenhaService);
    const request = { body } as Request<unknown, unknown, RedefinirSenhaDto>;
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const response = { status } as unknown as Response<RespostaApiSucesso<null>>;
    const next = jest.fn();

    await controller.resetPassword(request, response, next);

    expect(resetPassword).toHaveBeenCalledWith(body);
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      mensagem: MENSAGENS.senhaRedefinida,
      dados: null,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("encaminha erro de solicitacao de recuperacao para o middleware", async () => {
    const erro = new Error("falha no reset");
    const forgotPassword = jest.fn<RecuperarSenhaService["forgotPassword"]>(
      async () => {
        throw erro;
      },
    );
    const controller = new RecuperarSenhaController({
      forgotPassword,
    } as unknown as RecuperarSenhaService);
    const request = { body: {} } as Request<unknown, unknown, SolicitarRecuperacaoSenhaDto>;
    const status = jest.fn();
    const response = { status } as unknown as Response<RespostaApiSucesso<null>>;
    const next = jest.fn();

    await controller.forgotPassword(request, response, next);

    expect(next).toHaveBeenCalledWith(erro);
    expect(status).not.toHaveBeenCalled();
  });

  it("encaminha erro de redefinicao para o middleware", async () => {
    const erro = new Error("token invalido");
    const resetPassword = jest.fn<RecuperarSenhaService["resetPassword"]>(
      async () => {
        throw erro;
      },
    );
    const controller = new RecuperarSenhaController({
      resetPassword,
    } as unknown as RecuperarSenhaService);
    const request = { body: {} } as Request<unknown, unknown, RedefinirSenhaDto>;
    const status = jest.fn();
    const response = { status } as unknown as Response<RespostaApiSucesso<null>>;
    const next = jest.fn();

    await controller.resetPassword(request, response, next);

    expect(next).toHaveBeenCalledWith(erro);
    expect(status).not.toHaveBeenCalled();
  });
});
