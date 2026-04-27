jest.mock("node:crypto", () => ({
  randomUUID: jest.fn(() => "token-row-id"),
}));

import { prisma } from "@/config/db";
import { RecuperarSenhaRepository } from "@/modules/auth/recuperar-senha/recuperar-senha.repository";

jest.mock("@/config/db", () => ({
  prisma: {
    $executeRaw: jest.fn(),
    $queryRaw: jest.fn(),
    $transaction: jest.fn(),
  },
}));

type QueryRawMock = <T = unknown>(query: TemplateStringsArray, ...values: unknown[]) => Promise<T>;

type ExecuteRawMock = (query: TemplateStringsArray, ...values: unknown[]) => Promise<number>;

const queryRawMock = prisma.$queryRaw as unknown as jest.MockedFunction<QueryRawMock>;
const executeRawMock = prisma.$executeRaw as unknown as jest.MockedFunction<ExecuteRawMock>;
const transactionMock = prisma.$transaction as jest.MockedFunction<typeof prisma.$transaction>;

function criarTransacaoMock(tokensAtualizados: number) {
  const executeRawTransacaoMock = jest
    .fn<ReturnType<ExecuteRawMock>, Parameters<ExecuteRawMock>>()
    .mockResolvedValueOnce(tokensAtualizados)
    .mockResolvedValueOnce(1);

  transactionMock.mockImplementation(async (callback) => {
    return callback({
      $executeRaw: executeRawTransacaoMock,
    } as never);
  });

  return executeRawTransacaoMock;
}

describe("RecuperarSenhaRepository", () => {
  beforeEach(() => {
    queryRawMock.mockReset();
    executeRawMock.mockReset();
    transactionMock.mockReset();
  });

  it("busca usuario por email", async () => {
    queryRawMock.mockResolvedValue([{ id: "usuario-id", email: "aluno@example.com" }]);
    const repository = new RecuperarSenhaRepository();

    await expect(repository.buscarUsuarioPorEmail("aluno@example.com")).resolves.toEqual({
      id: "usuario-id",
      email: "aluno@example.com",
    });
    expect(queryRawMock).toHaveBeenCalledTimes(1);
  });

  it("retorna null quando usuario nao existe", async () => {
    queryRawMock.mockResolvedValue([]);
    const repository = new RecuperarSenhaRepository();

    await expect(repository.buscarUsuarioPorEmail("naoexiste@example.com")).resolves.toBeNull();
  });

  it("cria token de redefinicao de senha", async () => {
    executeRawMock.mockResolvedValue(1);
    const repository = new RecuperarSenhaRepository();

    await expect(
      repository.criarTokenRedefinicaoSenha({
        token: "reset-token",
        usuarioId: "usuario-id",
        expiraEm: new Date("2026-04-27T13:00:00.000Z"),
      }),
    ).resolves.toBeUndefined();
    expect(executeRawMock).toHaveBeenCalledTimes(1);
  });

  it("busca token de redefinicao de senha", async () => {
    const token = {
      token: "reset-token",
      usuarioId: "usuario-id",
      expiraEm: new Date("2026-04-27T13:00:00.000Z"),
      usadoEm: null,
    };
    queryRawMock.mockResolvedValue([token]);
    const repository = new RecuperarSenhaRepository();

    await expect(repository.buscarTokenRedefinicaoSenha("reset-token")).resolves.toEqual(token);
  });

  it("retorna null quando token nao existe", async () => {
    queryRawMock.mockResolvedValue([]);
    const repository = new RecuperarSenhaRepository();

    await expect(repository.buscarTokenRedefinicaoSenha("token-invalido")).resolves.toBeNull();
  });

  it("atualiza senha e marca token como usado em transacao", async () => {
    const executeRawTransacaoMock = criarTransacaoMock(1);
    const repository = new RecuperarSenhaRepository();

    await expect(
      repository.atualizarSenhaComToken({
        token: "reset-token",
        usuarioId: "usuario-id",
        senhaHash: "$2b$10$hash",
        agora: new Date("2026-04-27T12:00:00.000Z"),
      }),
    ).resolves.toBe(true);

    expect(executeRawTransacaoMock).toHaveBeenCalledTimes(2);
  });

  it("retorna false quando token nao pode ser marcado como usado", async () => {
    const executeRawTransacaoMock = criarTransacaoMock(0);
    const repository = new RecuperarSenhaRepository();

    await expect(
      repository.atualizarSenhaComToken({
        token: "reset-token",
        usuarioId: "usuario-id",
        senhaHash: "$2b$10$hash",
        agora: new Date("2026-04-27T12:00:00.000Z"),
      }),
    ).resolves.toBe(false);

    expect(executeRawTransacaoMock).toHaveBeenCalledTimes(1);
  });
});
