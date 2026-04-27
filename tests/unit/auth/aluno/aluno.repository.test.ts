import { prisma } from "@/config/db";
import { AlunoAuthRepository, type CriarAlunoData } from "@/modules/auth/aluno/aluno.repository";
import { VALOR_NAO_SE_APLICA } from "@/modules/auth/aluno/aluno.constants";
import { PAPEIS, STATUS_USUARIO } from "@/shared/constants/papeis";

jest.mock("@/config/db", () => ({
  prisma: {
    $queryRaw: jest.fn(),
  },
}));

type QueryRawMock = <T = unknown>(
  query: TemplateStringsArray,
  ...values: unknown[]
) => Promise<T>;

const queryRawMock = prisma.$queryRaw as unknown as jest.MockedFunction<QueryRawMock>;

function criarDadosAluno(overrides: Partial<CriarAlunoData> = {}): CriarAlunoData {
  return {
    nome: "Joao da Silva",
    nickname: "joao_silva",
    email: "joao@aluno.unb.br",
    senhaHash: "$2b$10$hash",
    instituicao: "Universidade de Brasilia",
    curso: "Medicina",
    periodo: "3",
    dataNascimento: new Date("2003-12-30T00:00:00.000Z"),
    nacionalidade: "Brasileiro",
    cidade: "Brasilia",
    estado: "DF",
    escolaridade: "GRADUACAO",
    papel: PAPEIS.ALUNO,
    status: STATUS_USUARIO.ATIVO,
    ...overrides,
  };
}

function criarRegistroBanco() {
  return {
    id: "usuario-id",
    nome: "Joao da Silva",
    nickname: "joao_silva",
    email: "joao@aluno.unb.br",
    instituicao: "Universidade de Brasilia",
    curso: "Medicina",
    semestre: "3",
    estado: "DF",
    cidade: "Brasilia",
    nacionalidade: "Brasileiro",
    dataNascimento: new Date("2003-12-30T00:00:00.000Z"),
    nivelEducacional: "GRADUACAO",
    perfil: PAPEIS.ALUNO,
    status: STATUS_USUARIO.ATIVO,
    criadoEm: new Date("2026-04-25T12:00:00.000Z"),
    atualizadoEm: new Date("2026-04-25T12:30:00.000Z"),
  };
}

describe("AlunoAuthRepository", () => {
  beforeEach(() => {
    queryRawMock.mockReset();
  });

  it("busca aluno por email", async () => {
    queryRawMock.mockResolvedValue([{ id: "usuario-id", email: "joao@aluno.unb.br" }]);
    const repository = new AlunoAuthRepository();

    await expect(repository.buscarPorEmail("joao@aluno.unb.br")).resolves.toEqual({
      id: "usuario-id",
      email: "joao@aluno.unb.br",
    });
    expect(queryRawMock).toHaveBeenCalledTimes(1);
  });

  it("retorna null quando nickname nao existe", async () => {
    queryRawMock.mockResolvedValue([]);
    const repository = new AlunoAuthRepository();

    await expect(repository.buscarPorNickname("joao_silva")).resolves.toBeNull();
  });

  it("cria aluno e converte o registro retornado pelo banco", async () => {
    queryRawMock.mockResolvedValue([criarRegistroBanco()]);
    const repository = new AlunoAuthRepository();

    await expect(repository.criar(criarDadosAluno())).resolves.toEqual({
      id: "usuario-id",
      nome: "Joao da Silva",
      nickname: "joao_silva",
      email: "joao@aluno.unb.br",
      instituicao: "Universidade de Brasilia",
      curso: "Medicina",
      periodo: "3",
      semVinculoAcademico: false,
      dataNascimento: new Date("2003-12-30T00:00:00.000Z"),
      nacionalidade: "Brasileiro",
      cidade: "Brasilia",
      estado: "DF",
      escolaridade: "GRADUACAO",
      papel: PAPEIS.ALUNO,
      status: STATUS_USUARIO.ATIVO,
      createdAt: new Date("2026-04-25T12:00:00.000Z"),
      updatedAt: new Date("2026-04-25T12:30:00.000Z"),
    });
    expect(queryRawMock).toHaveBeenCalledTimes(1);
  });

  it("marca aluno sem vinculo academico quando os tres campos usam Nao se aplica", async () => {
    queryRawMock.mockResolvedValue([
      {
        ...criarRegistroBanco(),
        instituicao: VALOR_NAO_SE_APLICA,
        curso: VALOR_NAO_SE_APLICA,
        semestre: VALOR_NAO_SE_APLICA,
      },
    ]);
    const repository = new AlunoAuthRepository();

    const aluno = await repository.criar(
      criarDadosAluno({
        instituicao: VALOR_NAO_SE_APLICA,
        curso: VALOR_NAO_SE_APLICA,
        periodo: VALOR_NAO_SE_APLICA,
      }),
    );

    expect(aluno.semVinculoAcademico).toBe(true);
  });
});
