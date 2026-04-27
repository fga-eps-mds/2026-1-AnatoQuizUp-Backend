jest.mock("node:crypto", () => ({
  randomUUID: jest.fn(() => "reset-token"),
}));

import bcrypt from "bcryptjs";

import type { RecuperarSenhaRepository } from "@/modules/auth/recuperar-senha/recuperar-senha.repository";
import { RecuperarSenhaService } from "@/modules/auth/recuperar-senha/recuperar-senha.service";
import { MENSAGENS } from "@/shared/constants/mensagens";
import { CodigoDeErro } from "@/shared/errors/codigos-de-erro";

type EnviarEmailMock = (destinatario: string, linkRedefinicao: string) => Promise<void>;

function criarRepositoryMock() {
  const buscarUsuarioPorEmail = jest.fn<RecuperarSenhaRepository["buscarUsuarioPorEmail"]>(
    async () => null,
  );
  const criarTokenRedefinicaoSenha = jest.fn<
    RecuperarSenhaRepository["criarTokenRedefinicaoSenha"]
  >(async () => undefined);
  const buscarTokenRedefinicaoSenha = jest.fn<
    RecuperarSenhaRepository["buscarTokenRedefinicaoSenha"]
  >(async () => null);
  const atualizarSenhaComToken = jest.fn<RecuperarSenhaRepository["atualizarSenhaComToken"]>(
    async () => true,
  );

  return {
    repository: {
      buscarUsuarioPorEmail,
      criarTokenRedefinicaoSenha,
      buscarTokenRedefinicaoSenha,
      atualizarSenhaComToken,
    } as unknown as RecuperarSenhaRepository,
    buscarUsuarioPorEmail,
    criarTokenRedefinicaoSenha,
    buscarTokenRedefinicaoSenha,
    atualizarSenhaComToken,
  };
}

describe("RecuperarSenhaService", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-04-27T12:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it("solicita reset com email existente, cria token de 1 hora e envia email", async () => {
    const { repository, buscarUsuarioPorEmail, criarTokenRedefinicaoSenha } =
      criarRepositoryMock();
    buscarUsuarioPorEmail.mockResolvedValue({
      id: "usuario-id",
      email: "aluno@example.com",
    });
    const enviarEmail = jest.fn<EnviarEmailMock>(async () => undefined);
    const service = new RecuperarSenhaService(repository, enviarEmail);

    await service.forgotPassword({ email: " ALUNO@EXAMPLE.COM " });

    expect(buscarUsuarioPorEmail).toHaveBeenCalledWith("aluno@example.com");
    expect(criarTokenRedefinicaoSenha).toHaveBeenCalledWith({
      token: "reset-token",
      usuarioId: "usuario-id",
      expiraEm: new Date("2026-04-27T13:00:00.000Z"),
    });
    expect(enviarEmail).toHaveBeenCalledWith(
      "aluno@example.com",
      "https://example.com/redefinir-senha?token=reset-token",
    );
  });

  it("solicita reset com email inexistente sem revelar existencia", async () => {
    const { repository, buscarUsuarioPorEmail, criarTokenRedefinicaoSenha } =
      criarRepositoryMock();
    const enviarEmail = jest.fn<EnviarEmailMock>(async () => undefined);
    const service = new RecuperarSenhaService(repository, enviarEmail);

    await expect(service.forgotPassword({ email: "naoexiste@example.com" })).resolves.toBeUndefined();

    expect(buscarUsuarioPorEmail).toHaveBeenCalledWith("naoexiste@example.com");
    expect(criarTokenRedefinicaoSenha).not.toHaveBeenCalled();
    expect(enviarEmail).not.toHaveBeenCalled();
  });

  it("reseta senha com token valido, atualiza senha hasheada e marca token como usado", async () => {
    const { repository, buscarTokenRedefinicaoSenha, atualizarSenhaComToken } =
      criarRepositoryMock();
    buscarTokenRedefinicaoSenha.mockResolvedValue({
      token: "reset-token",
      usuarioId: "usuario-id",
      expiraEm: new Date("2026-04-27T13:00:00.000Z"),
      usadoEm: null,
    });
    const service = new RecuperarSenhaService(repository);

    await service.resetPassword({ token: "reset-token", senha: "novaSenha123" });

    const dadosAtualizacao = atualizarSenhaComToken.mock.calls[0]?.[0];

    expect(dadosAtualizacao).toBeDefined();

    if (!dadosAtualizacao) {
      throw new Error("Dados de atualizacao nao capturados.");
    }

    expect(dadosAtualizacao.token).toBe("reset-token");
    expect(dadosAtualizacao.usuarioId).toBe("usuario-id");
    expect(dadosAtualizacao.agora).toEqual(new Date("2026-04-27T12:00:00.000Z"));
    expect(dadosAtualizacao.senhaHash).not.toBe("novaSenha123");
    await expect(bcrypt.compare("novaSenha123", dadosAtualizacao.senhaHash)).resolves.toBe(true);
  });

  it("retorna erro quando token esta expirado", async () => {
    const { repository, buscarTokenRedefinicaoSenha, atualizarSenhaComToken } =
      criarRepositoryMock();
    buscarTokenRedefinicaoSenha.mockResolvedValue({
      token: "reset-token",
      usuarioId: "usuario-id",
      expiraEm: new Date("2026-04-27T11:59:59.000Z"),
      usadoEm: null,
    });
    const service = new RecuperarSenhaService(repository);

    await expect(
      service.resetPassword({ token: "reset-token", senha: "novaSenha123" }),
    ).rejects.toMatchObject({
      codigoStatus: 400,
      codigo: CodigoDeErro.TOKEN_INVALIDO,
      message: MENSAGENS.linkRedefinicaoSenhaInvalido,
    });
    expect(atualizarSenhaComToken).not.toHaveBeenCalled();
  });

  it("retorna erro quando token ja foi usado", async () => {
    const { repository, buscarTokenRedefinicaoSenha, atualizarSenhaComToken } =
      criarRepositoryMock();
    buscarTokenRedefinicaoSenha.mockResolvedValue({
      token: "reset-token",
      usuarioId: "usuario-id",
      expiraEm: new Date("2026-04-27T13:00:00.000Z"),
      usadoEm: new Date("2026-04-27T12:10:00.000Z"),
    });
    const service = new RecuperarSenhaService(repository);

    await expect(
      service.resetPassword({ token: "reset-token", senha: "novaSenha123" }),
    ).rejects.toMatchObject({
      codigoStatus: 400,
      codigo: CodigoDeErro.TOKEN_INVALIDO,
      message: MENSAGENS.linkRedefinicaoSenhaInvalido,
    });
    expect(atualizarSenhaComToken).not.toHaveBeenCalled();
  });

  it("retorna erro quando token fica invalido durante a atualizacao", async () => {
    const { repository, buscarTokenRedefinicaoSenha, atualizarSenhaComToken } =
      criarRepositoryMock();
    buscarTokenRedefinicaoSenha.mockResolvedValue({
      token: "reset-token",
      usuarioId: "usuario-id",
      expiraEm: new Date("2026-04-27T13:00:00.000Z"),
      usadoEm: null,
    });
    atualizarSenhaComToken.mockResolvedValue(false);
    const service = new RecuperarSenhaService(repository);

    await expect(
      service.resetPassword({ token: "reset-token", senha: "novaSenha123" }),
    ).rejects.toMatchObject({
      codigoStatus: 400,
      codigo: CodigoDeErro.TOKEN_INVALIDO,
      message: MENSAGENS.linkRedefinicaoSenhaInvalido,
    });
  });
});
