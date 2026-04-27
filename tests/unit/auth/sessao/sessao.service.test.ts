import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";

import type { SessaoRepository, UsuarioSessao } from "@/modules/auth/sessao/sessao.repository";
import { jwtRefreshSecretKey } from "@/config/env";
import { SessaoService } from "@/modules/auth/sessao/sessao.service";
import { MENSAGENS } from "@/shared/constants/mensagens";
import { PAPEIS } from "@/shared/constants/papeis";
import { STATUS } from "@/shared/constants/status";
import { CodigoDeErro } from "@/shared/errors/codigos-de-erro";
import type { PayloadAutenticacao } from "@/shared/types/autenticacao.types";
import { gerarRefreshToken } from "@/shared/utils/jwt";

function criarUsuarioSessao(overrides: Partial<UsuarioSessao> = {}): UsuarioSessao {
  return {
    id: "usuario-id",
    nome: "Joao da Silva",
    nickname: "joao_silva",
    email: "joao@aluno.unb.br",
    senhaHash: bcrypt.hashSync("senha1234", 10),
    papel: PAPEIS.ALUNO,
    status: STATUS.ATIVO,
    excluidoEm: null,
    instituicao: "Universidade de Brasilia",
    curso: "Medicina",
    periodo: "3",
    semVinculoAcademico: false,
    dataNascimento: new Date("2003-12-30T00:00:00.000Z"),
    nacionalidade: "Brasileiro",
    cidade: "Brasilia",
    estado: "DF",
    escolaridade: "GRADUACAO",
    departamento: null,
    siape: null,
    aprovadoPorId: null,
    aprovadoEm: null,
    createdAt: new Date("2026-04-25T12:00:00.000Z"),
    updatedAt: new Date("2026-04-25T12:00:00.000Z"),
    ...overrides,
  };
}

function criarSessaoRepositoryMock(usuario: UsuarioSessao | null = criarUsuarioSessao()) {
  const buscarUsuarioPorEmail = jest
    .fn<SessaoRepository["buscarUsuarioPorEmail"]>()
    .mockResolvedValue(usuario);
  const buscarUsuarioPorId = jest
    .fn<SessaoRepository["buscarUsuarioPorId"]>()
    .mockResolvedValue(usuario);
  const salvarRefreshToken = jest
    .fn<SessaoRepository["salvarRefreshToken"]>()
    .mockResolvedValue(undefined);
  const buscarRefreshToken = jest
    .fn<SessaoRepository["buscarRefreshToken"]>()
    .mockResolvedValue(null);
  const rotacionarRefreshToken = jest
    .fn<SessaoRepository["rotacionarRefreshToken"]>()
    .mockResolvedValue(true);
  const revogarRefreshToken = jest
    .fn<SessaoRepository["revogarRefreshToken"]>()
    .mockResolvedValue(true);

  return {
    sessaoRepository: {
      buscarUsuarioPorEmail,
      buscarUsuarioPorId,
      salvarRefreshToken,
      buscarRefreshToken,
      rotacionarRefreshToken,
      revogarRefreshToken,
    } as unknown as SessaoRepository,
    buscarUsuarioPorEmail,
    buscarUsuarioPorId,
    salvarRefreshToken,
    buscarRefreshToken,
    rotacionarRefreshToken,
    revogarRefreshToken,
  };
}

function criarPayloadAutenticacao(): PayloadAutenticacao {
  return {
    id: "usuario-id",
    email: "joao@aluno.unb.br",
    papel: PAPEIS.ALUNO,
    status: STATUS.ATIVO,
  };
}

describe("SessaoService", () => {
  it("realiza login com credenciais validas, gera tokens e salva refresh token", async () => {
    const { sessaoRepository, buscarUsuarioPorEmail, salvarRefreshToken } =
      criarSessaoRepositoryMock();
    const service = new SessaoService(sessaoRepository);

    const resposta = await service.login({
      email: " JOAO@ALUNO.UNB.BR ",
      senha: "senha1234",
    });

    expect(buscarUsuarioPorEmail).toHaveBeenCalledWith("joao@aluno.unb.br");
    expect(resposta.accessToken).toEqual(expect.any(String));
    expect(resposta.refreshToken).toEqual(expect.any(String));
    expect(resposta).not.toHaveProperty("usuario");

    const payloadAccess = jwt.decode(resposta.accessToken) as PayloadAutenticacao & JwtPayload;
    const payloadRefresh = jwt.decode(resposta.refreshToken) as PayloadAutenticacao & JwtPayload;

    expect(payloadAccess).toMatchObject({
      id: "usuario-id",
      email: "joao@aluno.unb.br",
      papel: PAPEIS.ALUNO,
      status: STATUS.ATIVO,
    });
    expect(payloadRefresh).toMatchObject({
      id: "usuario-id",
      email: "joao@aluno.unb.br",
      papel: PAPEIS.ALUNO,
      status: STATUS.ATIVO,
    });
    expect(
      payloadAccess.exp && payloadAccess.iat ? payloadAccess.exp - payloadAccess.iat : 0,
    ).toBe(60 * 60);
    expect(
      payloadRefresh.exp && payloadRefresh.iat ? payloadRefresh.exp - payloadRefresh.iat : 0,
    ).toBe(7 * 24 * 60 * 60);

    expect(salvarRefreshToken).toHaveBeenCalledWith(
      "usuario-id",
      resposta.refreshToken,
      expect.any(Date),
    );
  });

  it("retorna dados do usuario autenticado", async () => {
    const { sessaoRepository, buscarUsuarioPorId } = criarSessaoRepositoryMock();
    const service = new SessaoService(sessaoRepository);

    const resposta = await service.obterUsuarioAutenticado("usuario-id");

    expect(buscarUsuarioPorId).toHaveBeenCalledWith("usuario-id");
    expect(resposta.usuario).toMatchObject({
      id: "usuario-id",
      nome: "Joao da Silva",
      nickname: "joao_silva",
      email: "joao@aluno.unb.br",
      papel: PAPEIS.ALUNO,
      status: STATUS.ATIVO,
      dataNascimento: "2003-12-30",
    });
    expect(resposta.usuario).not.toHaveProperty("senha");
    expect(resposta.usuario).not.toHaveProperty("senhaHash");
  });

  it("retorna dados do usuario autenticado com campos opcionais nulos e aprovadoEm preenchido", async () => {
    const { sessaoRepository } = criarSessaoRepositoryMock(
      criarUsuarioSessao({
        nickname: null,
        instituicao: null,
        curso: null,
        periodo: null,
        dataNascimento: null,
        nacionalidade: null,
        cidade: null,
        estado: null,
        escolaridade: null,
        aprovadoEm: new Date("2026-04-26T12:00:00.000Z"),
      }),
    );
    const service = new SessaoService(sessaoRepository);

    const resposta = await service.obterUsuarioAutenticado("usuario-id");

    expect(resposta.usuario).toMatchObject({
      nickname: null,
      instituicao: null,
      curso: null,
      periodo: null,
      dataNascimento: null,
      nacionalidade: null,
      cidade: null,
      estado: null,
      escolaridade: null,
      aprovadoEm: "2026-04-26T12:00:00.000Z",
    });
  });

  it("renova sessao com refresh token valido, gera novos tokens e rotaciona token antigo", async () => {
    const payload = criarPayloadAutenticacao();
    const refreshTokenAtual = gerarRefreshToken(payload);
    const {
      sessaoRepository,
      buscarRefreshToken,
      buscarUsuarioPorId,
      rotacionarRefreshToken,
    } = criarSessaoRepositoryMock();
    buscarRefreshToken.mockResolvedValueOnce({
      token: refreshTokenAtual,
      usuarioId: "usuario-id",
      expiraEm: new Date(Date.now() + 60 * 60 * 1000),
      revogadoEm: null,
    });
    const service = new SessaoService(sessaoRepository);

    const resposta = await service.renovarSessao({ refreshToken: refreshTokenAtual });

    expect(buscarRefreshToken).toHaveBeenCalledWith(refreshTokenAtual);
    expect(buscarUsuarioPorId).toHaveBeenCalledWith("usuario-id");
    expect(resposta.accessToken).toEqual(expect.any(String));
    expect(resposta.refreshToken).toEqual(expect.any(String));
    expect(resposta.refreshToken).not.toBe(refreshTokenAtual);
    expect(rotacionarRefreshToken).toHaveBeenCalledWith(
      refreshTokenAtual,
      "usuario-id",
      resposta.refreshToken,
      expect.any(Date),
    );
  });

  it("realiza logout revogando refresh token da sessao atual", async () => {
    const refreshToken = gerarRefreshToken(criarPayloadAutenticacao());
    const { sessaoRepository, buscarRefreshToken, revogarRefreshToken } =
      criarSessaoRepositoryMock();
    buscarRefreshToken.mockResolvedValueOnce({
      token: refreshToken,
      usuarioId: "usuario-id",
      expiraEm: new Date(Date.now() + 60 * 60 * 1000),
      revogadoEm: null,
    });
    const service = new SessaoService(sessaoRepository);

    await expect(
      service.logout("usuario-id", { refreshToken: ` ${refreshToken} ` }),
    ).resolves.toBeUndefined();

    expect(buscarRefreshToken).toHaveBeenCalledWith(refreshToken);
    expect(revogarRefreshToken).toHaveBeenCalledWith(refreshToken, "usuario-id");
  });

  it("retorna 401 ao fazer logout com refresh token nao encontrado", async () => {
    const { sessaoRepository, buscarRefreshToken, revogarRefreshToken } =
      criarSessaoRepositoryMock();
    buscarRefreshToken.mockResolvedValueOnce(null);
    const service = new SessaoService(sessaoRepository);

    await expect(
      service.logout("usuario-id", { refreshToken: "refresh-token-inexistente" }),
    ).rejects.toMatchObject({
      codigoStatus: 401,
      codigo: CodigoDeErro.TOKEN_INVALIDO,
      message: MENSAGENS.tokenInvalido,
    });
    expect(revogarRefreshToken).not.toHaveBeenCalled();
  });

  it("retorna 401 ao fazer logout com refresh token ja revogado", async () => {
    const refreshToken = gerarRefreshToken(criarPayloadAutenticacao());
    const { sessaoRepository, buscarRefreshToken, revogarRefreshToken } =
      criarSessaoRepositoryMock();
    buscarRefreshToken.mockResolvedValueOnce({
      token: refreshToken,
      usuarioId: "usuario-id",
      expiraEm: new Date(Date.now() + 60 * 60 * 1000),
      revogadoEm: new Date("2026-04-26T12:00:00.000Z"),
    });
    const service = new SessaoService(sessaoRepository);

    await expect(service.logout("usuario-id", { refreshToken })).rejects.toMatchObject({
      codigoStatus: 401,
      codigo: CodigoDeErro.TOKEN_INVALIDO,
      message: MENSAGENS.tokenInvalido,
    });
    expect(revogarRefreshToken).not.toHaveBeenCalled();
  });

  it("retorna 401 ao fazer logout com refresh token de outro usuario", async () => {
    const refreshToken = gerarRefreshToken(criarPayloadAutenticacao());
    const { sessaoRepository, buscarRefreshToken, revogarRefreshToken } =
      criarSessaoRepositoryMock();
    buscarRefreshToken.mockResolvedValueOnce({
      token: refreshToken,
      usuarioId: "outro-usuario-id",
      expiraEm: new Date(Date.now() + 60 * 60 * 1000),
      revogadoEm: null,
    });
    const service = new SessaoService(sessaoRepository);

    await expect(service.logout("usuario-id", { refreshToken })).rejects.toMatchObject({
      codigoStatus: 401,
      codigo: CodigoDeErro.TOKEN_INVALIDO,
      message: MENSAGENS.tokenInvalido,
    });
    expect(revogarRefreshToken).not.toHaveBeenCalled();
  });

  it("retorna 401 ao fazer logout quando token nao foi revogado por concorrencia", async () => {
    const refreshToken = gerarRefreshToken(criarPayloadAutenticacao());
    const { sessaoRepository, buscarRefreshToken, revogarRefreshToken } =
      criarSessaoRepositoryMock();
    buscarRefreshToken.mockResolvedValueOnce({
      token: refreshToken,
      usuarioId: "usuario-id",
      expiraEm: new Date(Date.now() + 60 * 60 * 1000),
      revogadoEm: null,
    });
    revogarRefreshToken.mockResolvedValueOnce(false);
    const service = new SessaoService(sessaoRepository);

    await expect(service.logout("usuario-id", { refreshToken })).rejects.toMatchObject({
      codigoStatus: 401,
      codigo: CodigoDeErro.TOKEN_INVALIDO,
      message: MENSAGENS.tokenInvalido,
    });
  });

  it("retorna 401 ao renovar sessao com refresh token expirado", async () => {
    const refreshTokenExpirado = jwt.sign(criarPayloadAutenticacao(), jwtRefreshSecretKey, {
      expiresIn: "-1s",
    });
    const { sessaoRepository, buscarRefreshToken, rotacionarRefreshToken } =
      criarSessaoRepositoryMock();
    const service = new SessaoService(sessaoRepository);

    await expect(
      service.renovarSessao({ refreshToken: refreshTokenExpirado }),
    ).rejects.toMatchObject({
      codigoStatus: 401,
      codigo: CodigoDeErro.TOKEN_EXPIRADO,
    });
    expect(buscarRefreshToken).not.toHaveBeenCalled();
    expect(rotacionarRefreshToken).not.toHaveBeenCalled();
  });

  it("retorna 401 ao renovar sessao com refresh token ja revogado", async () => {
    const refreshTokenAtual = gerarRefreshToken(criarPayloadAutenticacao());
    const { sessaoRepository, buscarRefreshToken, rotacionarRefreshToken } =
      criarSessaoRepositoryMock();
    buscarRefreshToken.mockResolvedValueOnce({
      token: refreshTokenAtual,
      usuarioId: "usuario-id",
      expiraEm: new Date(Date.now() + 60 * 60 * 1000),
      revogadoEm: new Date("2026-04-26T12:00:00.000Z"),
    });
    const service = new SessaoService(sessaoRepository);

    await expect(service.renovarSessao({ refreshToken: refreshTokenAtual })).rejects.toMatchObject({
      codigoStatus: 401,
      codigo: CodigoDeErro.TOKEN_INVALIDO,
      message: MENSAGENS.tokenInvalido,
    });
    expect(rotacionarRefreshToken).not.toHaveBeenCalled();
  });

  it("retorna 401 ao renovar sessao com refresh token nao encontrado no banco", async () => {
    const refreshTokenAtual = gerarRefreshToken(criarPayloadAutenticacao());
    const { sessaoRepository, buscarRefreshToken, rotacionarRefreshToken } =
      criarSessaoRepositoryMock();
    buscarRefreshToken.mockResolvedValueOnce(null);
    const service = new SessaoService(sessaoRepository);

    await expect(service.renovarSessao({ refreshToken: refreshTokenAtual })).rejects.toMatchObject({
      codigoStatus: 401,
      codigo: CodigoDeErro.TOKEN_INVALIDO,
      message: MENSAGENS.tokenInvalido,
    });
    expect(rotacionarRefreshToken).not.toHaveBeenCalled();
  });

  it("retorna 401 ao renovar sessao com refresh token expirado no banco", async () => {
    const refreshTokenAtual = gerarRefreshToken(criarPayloadAutenticacao());
    const { sessaoRepository, buscarRefreshToken, rotacionarRefreshToken } =
      criarSessaoRepositoryMock();
    buscarRefreshToken.mockResolvedValueOnce({
      token: refreshTokenAtual,
      usuarioId: "usuario-id",
      expiraEm: new Date(Date.now() - 1000),
      revogadoEm: null,
    });
    const service = new SessaoService(sessaoRepository);

    await expect(service.renovarSessao({ refreshToken: refreshTokenAtual })).rejects.toMatchObject({
      codigoStatus: 401,
      codigo: CodigoDeErro.TOKEN_INVALIDO,
      message: MENSAGENS.tokenInvalido,
    });
    expect(rotacionarRefreshToken).not.toHaveBeenCalled();
  });

  it("retorna 401 quando refresh token ja foi rotacionado por outra requisicao", async () => {
    const refreshTokenAtual = gerarRefreshToken(criarPayloadAutenticacao());
    const { sessaoRepository, buscarRefreshToken, rotacionarRefreshToken } =
      criarSessaoRepositoryMock();
    buscarRefreshToken.mockResolvedValueOnce({
      token: refreshTokenAtual,
      usuarioId: "usuario-id",
      expiraEm: new Date(Date.now() + 60 * 60 * 1000),
      revogadoEm: null,
    });
    rotacionarRefreshToken.mockResolvedValueOnce(false);
    const service = new SessaoService(sessaoRepository);

    await expect(service.renovarSessao({ refreshToken: refreshTokenAtual })).rejects.toMatchObject({
      codigoStatus: 401,
      codigo: CodigoDeErro.TOKEN_INVALIDO,
      message: MENSAGENS.tokenInvalido,
    });
  });

  it("retorna 401 ao renovar sessao quando refresh token pertence a outro usuario", async () => {
    const refreshTokenAtual = gerarRefreshToken(criarPayloadAutenticacao());
    const { sessaoRepository, buscarRefreshToken, rotacionarRefreshToken } =
      criarSessaoRepositoryMock();
    buscarRefreshToken.mockResolvedValueOnce({
      token: refreshTokenAtual,
      usuarioId: "outro-usuario-id",
      expiraEm: new Date(Date.now() + 60 * 60 * 1000),
      revogadoEm: null,
    });
    const service = new SessaoService(sessaoRepository);

    await expect(service.renovarSessao({ refreshToken: refreshTokenAtual })).rejects.toMatchObject({
      codigoStatus: 401,
      codigo: CodigoDeErro.TOKEN_INVALIDO,
      message: MENSAGENS.tokenInvalido,
    });
    expect(rotacionarRefreshToken).not.toHaveBeenCalled();
  });

  it("retorna 401 ao renovar sessao quando usuario nao existe", async () => {
    const refreshTokenAtual = gerarRefreshToken(criarPayloadAutenticacao());
    const { sessaoRepository, buscarRefreshToken, rotacionarRefreshToken } =
      criarSessaoRepositoryMock(null);
    buscarRefreshToken.mockResolvedValueOnce({
      token: refreshTokenAtual,
      usuarioId: "usuario-id",
      expiraEm: new Date(Date.now() + 60 * 60 * 1000),
      revogadoEm: null,
    });
    const service = new SessaoService(sessaoRepository);

    await expect(service.renovarSessao({ refreshToken: refreshTokenAtual })).rejects.toMatchObject({
      codigoStatus: 401,
      codigo: CodigoDeErro.TOKEN_INVALIDO,
      message: MENSAGENS.tokenInvalido,
    });
    expect(rotacionarRefreshToken).not.toHaveBeenCalled();
  });

  it("retorna 401 ao renovar sessao quando usuario esta excluido logicamente", async () => {
    const refreshTokenAtual = gerarRefreshToken(criarPayloadAutenticacao());
    const { sessaoRepository, buscarRefreshToken, rotacionarRefreshToken } =
      criarSessaoRepositoryMock(
        criarUsuarioSessao({ excluidoEm: new Date("2026-04-26T12:00:00.000Z") }),
      );
    buscarRefreshToken.mockResolvedValueOnce({
      token: refreshTokenAtual,
      usuarioId: "usuario-id",
      expiraEm: new Date(Date.now() + 60 * 60 * 1000),
      revogadoEm: null,
    });
    const service = new SessaoService(sessaoRepository);

    await expect(service.renovarSessao({ refreshToken: refreshTokenAtual })).rejects.toMatchObject({
      codigoStatus: 401,
      codigo: CodigoDeErro.TOKEN_INVALIDO,
      message: MENSAGENS.tokenInvalido,
    });
    expect(rotacionarRefreshToken).not.toHaveBeenCalled();
  });

  it("retorna 403 ao renovar sessao quando usuario esta com status bloqueante", async () => {
    const refreshTokenAtual = gerarRefreshToken(criarPayloadAutenticacao());
    const { sessaoRepository, buscarRefreshToken, rotacionarRefreshToken } =
      criarSessaoRepositoryMock(criarUsuarioSessao({ status: STATUS.INATIVO }));
    buscarRefreshToken.mockResolvedValueOnce({
      token: refreshTokenAtual,
      usuarioId: "usuario-id",
      expiraEm: new Date(Date.now() + 60 * 60 * 1000),
      revogadoEm: null,
    });
    const service = new SessaoService(sessaoRepository);

    await expect(service.renovarSessao({ refreshToken: refreshTokenAtual })).rejects.toMatchObject({
      codigoStatus: 403,
      codigo: CodigoDeErro.CONTA_DESATIVADA,
      message: MENSAGENS.contaDesativada,
    });
    expect(rotacionarRefreshToken).not.toHaveBeenCalled();
  });

  it("retorna 401 ao buscar usuario autenticado inexistente", async () => {
    const { sessaoRepository } = criarSessaoRepositoryMock(null);
    const service = new SessaoService(sessaoRepository);

    await expect(service.obterUsuarioAutenticado("usuario-inexistente")).rejects.toMatchObject({
      codigoStatus: 401,
      codigo: CodigoDeErro.TOKEN_INVALIDO,
      message: MENSAGENS.tokenInvalido,
    });
  });

  it("retorna 401 ao buscar usuario autenticado excluido logicamente", async () => {
    const { sessaoRepository } = criarSessaoRepositoryMock(
      criarUsuarioSessao({ excluidoEm: new Date("2026-04-26T12:00:00.000Z") }),
    );
    const service = new SessaoService(sessaoRepository);

    await expect(service.obterUsuarioAutenticado("usuario-id")).rejects.toMatchObject({
      codigoStatus: 401,
      codigo: CodigoDeErro.TOKEN_INVALIDO,
      message: MENSAGENS.tokenInvalido,
    });
  });

  it("retorna 401 quando email nao existe", async () => {
    const { sessaoRepository, salvarRefreshToken } = criarSessaoRepositoryMock(null);
    const service = new SessaoService(sessaoRepository);

    await expect(
      service.login({ email: "inexistente@aluno.unb.br", senha: "senha1234" }),
    ).rejects.toMatchObject({
      codigoStatus: 401,
      codigo: CodigoDeErro.NAO_AUTORIZADO,
      message: MENSAGENS.credenciaisInvalidas,
    });
    expect(salvarRefreshToken).not.toHaveBeenCalled();
  });

  it("retorna 401 quando senha esta incorreta", async () => {
    const { sessaoRepository, salvarRefreshToken } = criarSessaoRepositoryMock();
    const service = new SessaoService(sessaoRepository);

    await expect(
      service.login({ email: "joao@aluno.unb.br", senha: "senha-errada" }),
    ).rejects.toMatchObject({
      codigoStatus: 401,
      codigo: CodigoDeErro.NAO_AUTORIZADO,
      message: MENSAGENS.credenciaisInvalidas,
    });
    expect(salvarRefreshToken).not.toHaveBeenCalled();
  });

  it("retorna 401 quando usuario esta excluido logicamente", async () => {
    const { sessaoRepository, salvarRefreshToken } = criarSessaoRepositoryMock(
      criarUsuarioSessao({ excluidoEm: new Date("2026-04-26T12:00:00.000Z") }),
    );
    const service = new SessaoService(sessaoRepository);

    await expect(
      service.login({ email: "joao@aluno.unb.br", senha: "senha1234" }),
    ).rejects.toMatchObject({
      codigoStatus: 401,
      codigo: CodigoDeErro.NAO_AUTORIZADO,
      message: MENSAGENS.credenciaisInvalidas,
    });
    expect(salvarRefreshToken).not.toHaveBeenCalled();
  });

  it.each([
    [STATUS.PENDENTE, CodigoDeErro.CADASTRO_EM_ANALISE, MENSAGENS.cadastroEmAnalise],
    [STATUS.INATIVO, CodigoDeErro.CONTA_DESATIVADA, MENSAGENS.contaDesativada],
    [STATUS.RECUSADO, CodigoDeErro.CADASTRO_RECUSADO, MENSAGENS.cadastroRecusado],
  ])("retorna 403 quando status do usuario e %s", async (status, codigo, mensagem) => {
    const { sessaoRepository, salvarRefreshToken } = criarSessaoRepositoryMock(
      criarUsuarioSessao({ status }),
    );
    const service = new SessaoService(sessaoRepository);

    await expect(
      service.login({ email: "joao@aluno.unb.br", senha: "senha1234" }),
    ).rejects.toMatchObject({
      codigoStatus: 403,
      codigo,
      message: mensagem,
    });
    expect(salvarRefreshToken).not.toHaveBeenCalled();
  });
});
