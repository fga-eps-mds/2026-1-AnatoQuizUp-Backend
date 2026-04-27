import { prisma } from "@/config/db";
import { VALOR_NAO_SE_APLICA } from "@/modules/auth/aluno/aluno.constants";
import { SessaoRepository } from "@/modules/auth/sessao/sessao.repository";
import { PAPEIS } from "@/shared/constants/papeis";
import { STATUS } from "@/shared/constants/status";

jest.mock("@/config/db", () => ({
  prisma: {
    $queryRaw: jest.fn(),
    $executeRaw: jest.fn(),
  },
}));

type QueryRawMock = <T = unknown>(
  query: TemplateStringsArray,
  ...values: unknown[]
) => Promise<T>;

type ExecuteRawMock = (
  query: TemplateStringsArray,
  ...values: unknown[]
) => Promise<number>;

const queryRawMock = prisma.$queryRaw as unknown as jest.MockedFunction<QueryRawMock>;
const executeRawMock = prisma.$executeRaw as unknown as jest.MockedFunction<ExecuteRawMock>;

function criarRegistroUsuario(overrides: Record<string, unknown> = {}) {
  return {
    id: "usuario-id",
    nome: "Joao da Silva",
    nickname: "joao_silva",
    email: "joao@aluno.unb.br",
    senha: "$2b$10$hash",
    perfil: "ALUNO",
    status: STATUS.ATIVO,
    excluidoEm: null,
    instituicao: "Universidade de Brasilia",
    curso: "Medicina",
    semestre: "3",
    dataNascimento: new Date("2003-12-30T00:00:00.000Z"),
    nacionalidade: "Brasileiro",
    cidade: "Brasilia",
    estado: "DF",
    nivelEducacional: "GRADUACAO",
    departamento: null,
    siape: null,
    aprovadoPorId: null,
    aprovadoEm: null,
    criadoEm: new Date("2026-04-25T12:00:00.000Z"),
    atualizadoEm: new Date("2026-04-25T12:30:00.000Z"),
    ...overrides,
  };
}

describe("SessaoRepository", () => {
  beforeEach(() => {
    queryRawMock.mockReset();
    executeRawMock.mockReset();
  });

  it("busca usuario por email e converte o registro do banco", async () => {
    queryRawMock.mockResolvedValueOnce([criarRegistroUsuario()]);
    const repository = new SessaoRepository();

    await expect(repository.buscarUsuarioPorEmail("joao@aluno.unb.br")).resolves.toEqual({
      id: "usuario-id",
      nome: "Joao da Silva",
      nickname: "joao_silva",
      email: "joao@aluno.unb.br",
      senhaHash: "$2b$10$hash",
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
      updatedAt: new Date("2026-04-25T12:30:00.000Z"),
    });
    expect(queryRawMock).toHaveBeenCalledTimes(1);
  });

  it("retorna null quando usuario por email nao existe", async () => {
    queryRawMock.mockResolvedValueOnce([]);
    const repository = new SessaoRepository();

    await expect(repository.buscarUsuarioPorEmail("inexistente@unb.br")).resolves.toBeNull();
  });

  it("busca usuario por id e converte perfil ADMIN para papel ADMINISTRADOR", async () => {
    queryRawMock.mockResolvedValueOnce([
      criarRegistroUsuario({
        perfil: "ADMIN",
      }),
    ]);
    const repository = new SessaoRepository();

    const usuario = await repository.buscarUsuarioPorId("usuario-id");

    expect(usuario?.papel).toBe(PAPEIS.ADMINISTRADOR);
    expect(queryRawMock).toHaveBeenCalledTimes(1);
  });

  it("marca usuario sem vinculo academico quando campos academicos usam Nao se aplica", async () => {
    queryRawMock.mockResolvedValueOnce([
      criarRegistroUsuario({
        instituicao: VALOR_NAO_SE_APLICA,
        curso: VALOR_NAO_SE_APLICA,
        semestre: VALOR_NAO_SE_APLICA,
      }),
    ]);
    const repository = new SessaoRepository();

    const usuario = await repository.buscarUsuarioPorId("usuario-id");

    expect(usuario?.semVinculoAcademico).toBe(true);
  });

  it("retorna null quando usuario por id nao existe", async () => {
    queryRawMock.mockResolvedValueOnce([]);
    const repository = new SessaoRepository();

    await expect(repository.buscarUsuarioPorId("usuario-inexistente")).resolves.toBeNull();
  });

  it("salva refresh token", async () => {
    executeRawMock.mockResolvedValueOnce(1);
    const repository = new SessaoRepository();
    const expiraEm = new Date("2026-05-02T12:00:00.000Z");

    await expect(
      repository.salvarRefreshToken("usuario-id", "refresh-token", expiraEm),
    ).resolves.toBeUndefined();

    expect(executeRawMock).toHaveBeenCalledTimes(1);
  });
});
