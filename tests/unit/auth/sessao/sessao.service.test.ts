import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";

import type { SessaoRepository, UsuarioSessao } from "@/modules/auth/sessao/sessao.repository";
import { SessaoService } from "@/modules/auth/sessao/sessao.service";
import { MENSAGENS } from "@/shared/constants/mensagens";
import { PAPEIS } from "@/shared/constants/papeis";
import { STATUS } from "@/shared/constants/status";
import { CodigoDeErro } from "@/shared/errors/codigos-de-erro";
import type { PayloadAutenticacao } from "@/shared/types/autenticacao.types";

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
  const salvarRefreshToken = jest
    .fn<SessaoRepository["salvarRefreshToken"]>()
    .mockResolvedValue(undefined);

  return {
    sessaoRepository: {
      buscarUsuarioPorEmail,
      salvarRefreshToken,
    } as unknown as SessaoRepository,
    buscarUsuarioPorEmail,
    salvarRefreshToken,
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
    [STATUS.PENDENTE, MENSAGENS.cadastroEmAnalise],
    [STATUS.INATIVO, MENSAGENS.contaDesativada],
    [STATUS.RECUSADO, MENSAGENS.cadastroRecusado],
  ])("retorna 401 quando status do usuario e %s", async (status, mensagem) => {
    const { sessaoRepository, salvarRefreshToken } = criarSessaoRepositoryMock(
      criarUsuarioSessao({ status }),
    );
    const service = new SessaoService(sessaoRepository);

    await expect(
      service.login({ email: "joao@aluno.unb.br", senha: "senha1234" }),
    ).rejects.toMatchObject({
      codigoStatus: 401,
      codigo: CodigoDeErro.NAO_AUTORIZADO,
      message: mensagem,
    });
    expect(salvarRefreshToken).not.toHaveBeenCalled();
  });
});
