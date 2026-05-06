import type { Request, Response } from "express";

import { SessaoController } from "@/modules/auth/sessao/sessao.controller";
import type {
  LoginDto,
  LogoutDto,
  RefreshTokenDto,
  RespostaLoginDto,
  RespostaRenovarSessaoDto,
  RespostaUsuarioAutenticadoDto,
} from "@/modules/auth/sessao/dto/login.types";
import type { SessaoService } from "@/modules/auth/sessao/sessao.service";
import { MENSAGENS } from "@/shared/constants/mensagens";
import { PAPEIS } from "@/shared/constants/papeis";
import { STATUS } from "@/shared/constants/status";
import { CodigoDeErro } from "@/shared/errors/codigos-de-erro";
import type { RespostaApiSucesso } from "@/shared/types/api.types";

describe("SessaoController", () => {
  it("retorna 200 com tokens", async () => {
    const body: LoginDto = {
      email: "joao@aluno.unb.br",
      senha: "senha1234",
    };
    const dados: RespostaLoginDto = {
      accessToken: "access-token",
      refreshToken: "refresh-token",
    };
    const login = jest.fn<SessaoService["login"]>().mockResolvedValue(dados);
    const controller = new SessaoController({ login } as unknown as SessaoService);
    const request = { body } as Request<unknown, unknown, LoginDto>;
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const response = { status } as unknown as Response<RespostaApiSucesso<RespostaLoginDto>>;
    const next = jest.fn();

    await controller.login(request, response, next);

    expect(login).toHaveBeenCalledWith(body);
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      mensagem: MENSAGENS.loginRealizado,
      dados,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("retorna 200 com usuario autenticado", async () => {
    const dados: RespostaUsuarioAutenticadoDto = {
      usuario: {
        id: "usuario-id",
        nome: "Joao da Silva",
        nickname: "joao_silva",
        email: "joao@aluno.unb.br",
        papel: PAPEIS.ALUNO,
        status: STATUS.ATIVO,
        instituicao: "Universidade de Brasilia",
        curso: "Medicina",
        periodo: "3",
        semVinculoAcademico: false,
        dataNascimento: "2003-12-30",
        nacionalidade: "Brasileiro",
        cidade: "Brasilia",
        estado: "DF",
        escolaridade: "GRADUACAO",
        departamento: null,
        siape: null,
        aprovadoPorId: null,
        aprovadoEm: null,
        createdAt: "2026-04-25T12:00:00.000Z",
        updatedAt: "2026-04-25T12:00:00.000Z",
      },
    };
    const obterUsuarioAutenticado = jest
      .fn<SessaoService["obterUsuarioAutenticado"]>()
      .mockResolvedValue(dados);
    const controller = new SessaoController({
      obterUsuarioAutenticado,
    } as unknown as SessaoService);
    const request = {
      usuario: {
        id: "usuario-id",
        email: "joao@aluno.unb.br",
        papel: PAPEIS.ALUNO,
      },
    } as Request;
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const response = {
      status,
    } as unknown as Response<RespostaApiSucesso<RespostaUsuarioAutenticadoDto>>;
    const next = jest.fn();

    await controller.obterUsuarioAutenticado(request, response, next);

    expect(obterUsuarioAutenticado).toHaveBeenCalledWith("usuario-id");
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      mensagem: MENSAGENS.usuarioAutenticadoEncontrado,
      dados,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("retorna 200 com novos tokens ao renovar sessao", async () => {
    const body: RefreshTokenDto = {
      refreshToken: "refresh-token-atual",
    };
    const dados: RespostaRenovarSessaoDto = {
      accessToken: "novo-access-token",
      refreshToken: "novo-refresh-token",
    };
    const renovarSessao = jest
      .fn<SessaoService["renovarSessao"]>()
      .mockResolvedValue(dados);
    const controller = new SessaoController({
      renovarSessao,
    } as unknown as SessaoService);
    const request = { body } as Request<unknown, unknown, RefreshTokenDto>;
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const response = {
      status,
    } as unknown as Response<RespostaApiSucesso<RespostaRenovarSessaoDto>>;
    const next = jest.fn();

    await controller.renovarSessao(request, response, next);

    expect(renovarSessao).toHaveBeenCalledWith(body);
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      mensagem: MENSAGENS.sessaoRenovada,
      dados,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("retorna 204 ao realizar logout", async () => {
    const body: LogoutDto = {
      refreshToken: "refresh-token",
    };
    const logout = jest.fn<SessaoService["logout"]>().mockResolvedValue(undefined);
    const controller = new SessaoController({
      logout,
    } as unknown as SessaoService);
    const request = {
      body,
      usuario: {
        id: "usuario-id",
        email: "joao@aluno.unb.br",
        papel: PAPEIS.ALUNO,
      },
    } as Request<unknown, unknown, LogoutDto>;
    const send = jest.fn();
    const status = jest.fn(() => ({ send }));
    const response = {
      status,
    } as unknown as Response<void>;
    const next = jest.fn();

    await controller.logout(request, response, next);

    expect(logout).toHaveBeenCalledWith("usuario-id", body);
    expect(status).toHaveBeenCalledWith(204);
    expect(send).toHaveBeenCalledWith();
    expect(next).not.toHaveBeenCalled();
  });

  it("encaminha erro do service para o middleware de erro", async () => {
    const error = new Error("erro");
    const login = jest.fn<SessaoService["login"]>().mockRejectedValue(error);
    const controller = new SessaoController({ login } as unknown as SessaoService);
    const request = {
      body: { email: "joao@aluno.unb.br", senha: "senha1234" },
    } as Request<unknown, unknown, LoginDto>;
    const response = {} as Response<RespostaApiSucesso<RespostaLoginDto>>;
    const next = jest.fn();

    await controller.login(request, response, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it("encaminha erro do service ao renovar sessao", async () => {
    const error = new Error("erro");
    const renovarSessao = jest
      .fn<SessaoService["renovarSessao"]>()
      .mockRejectedValue(error);
    const controller = new SessaoController({
      renovarSessao,
    } as unknown as SessaoService);
    const request = {
      body: { refreshToken: "refresh-token-atual" },
    } as Request<unknown, unknown, RefreshTokenDto>;
    const response = {} as Response<RespostaApiSucesso<RespostaRenovarSessaoDto>>;
    const next = jest.fn();

    await controller.renovarSessao(request, response, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it("encaminha erro do service ao realizar logout", async () => {
    const error = new Error("erro");
    const logout = jest.fn<SessaoService["logout"]>().mockRejectedValue(error);
    const controller = new SessaoController({
      logout,
    } as unknown as SessaoService);
    const request = {
      body: { refreshToken: "refresh-token" },
      usuario: {
        id: "usuario-id",
        email: "joao@aluno.unb.br",
        papel: PAPEIS.ALUNO,
      },
    } as Request<unknown, unknown, LogoutDto>;
    const response = {} as Response<void>;
    const next = jest.fn();

    await controller.logout(request, response, next);

    expect(logout).toHaveBeenCalledWith("usuario-id", { refreshToken: "refresh-token" });
    expect(next).toHaveBeenCalledWith(error);
  });

  it("encaminha erro do service ao buscar usuario autenticado", async () => {
    const error = new Error("erro");
    const obterUsuarioAutenticado = jest
      .fn<SessaoService["obterUsuarioAutenticado"]>()
      .mockRejectedValue(error);
    const controller = new SessaoController({
      obterUsuarioAutenticado,
    } as unknown as SessaoService);
    const request = {
      usuario: {
        id: "usuario-id",
        email: "joao@aluno.unb.br",
        papel: PAPEIS.ALUNO,
      },
    } as Request;
    const response = {} as Response<RespostaApiSucesso<RespostaUsuarioAutenticadoDto>>;
    const next = jest.fn();

    await controller.obterUsuarioAutenticado(request, response, next);

    expect(obterUsuarioAutenticado).toHaveBeenCalledWith("usuario-id");
    expect(next).toHaveBeenCalledWith(error);
  });

  it("encaminha erro quando usuario atual e chamado sem usuario autenticado", async () => {
    const obterUsuarioAutenticado = jest.fn<SessaoService["obterUsuarioAutenticado"]>();
    const controller = new SessaoController({
      obterUsuarioAutenticado,
    } as unknown as SessaoService);
    const request = {} as Request;
    const response = {} as Response<RespostaApiSucesso<RespostaUsuarioAutenticadoDto>>;
    const next = jest.fn();

    await controller.obterUsuarioAutenticado(request, response, next);

    expect(obterUsuarioAutenticado).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        codigoStatus: 401,
        codigo: CodigoDeErro.TOKEN_INVALIDO,
        message: MENSAGENS.tokenInvalido,
      }),
    );
  });

  it("encaminha erro quando logout e chamado sem usuario autenticado", async () => {
    const logout = jest.fn<SessaoService["logout"]>();
    const controller = new SessaoController({
      logout,
    } as unknown as SessaoService);
    const request = {
      body: { refreshToken: "refresh-token" },
    } as Request<unknown, unknown, LogoutDto>;
    const response = {} as Response<void>;
    const next = jest.fn();

    await controller.logout(request, response, next);

    expect(logout).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        codigoStatus: 401,
        codigo: CodigoDeErro.TOKEN_INVALIDO,
        message: MENSAGENS.tokenInvalido,
      }),
    );
  });
});
