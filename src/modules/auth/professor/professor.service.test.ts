import { Prisma } from "@prisma/client";

import { MENSAGENS } from "@/shared/constants/mensagens";
import type { ErroAplicacao } from "@/shared/errors/erro-aplicacao";

import type { RegistroProfessor } from "./dto/resposta.professor.types";
import type { ProfessorAuthRepository } from "./professor.repository";
import { ProfessorAuthService } from "./professor.service";

const inputValido = {
  nome: " Hilmer Rodrigues Neri ",
  email: " HILMER@MEDICINA.UNB.BR ",
  siape: "1234567",
  instituicao: "UnB",
  departamento: " Anatomia ",
  curso: " Medicina ",
  senha: "password123",
  confirmacaoSenha: "password123",
};

function criarRegistroProfessor(overrides: Partial<RegistroProfessor> = {}): RegistroProfessor {
  return {
    id: "professor-1",
    nome: "Hilmer Rodrigues Neri",
    email: "hilmer@medicina.unb.br",
    instituicao: "UnB",
    departamento: "Anatomia",
    curso: "Medicina",
    siape: "1234567",
    papel: "PROFESSOR",
    status: "PENDENTE",
    criadoEm: new Date("2026-05-10T10:00:00.000Z"),
    atualizadoEm: new Date("2026-05-10T10:00:00.000Z"),
    ...overrides,
  };
}

function criarErroCampoUnico(campo: string) {
  return new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
    code: "P2002",
    clientVersion: "6.17.1",
    meta: {
      target: [campo],
    },
  });
}

describe("ProfessorAuthService", () => {
  let professorAuthRepository: jest.Mocked<ProfessorAuthRepository>;
  let service: ProfessorAuthService;

  beforeEach(() => {
    professorAuthRepository = {
      buscarPorEmail: jest.fn(),
      buscarPorSiape: jest.fn(),
      criar: jest.fn(),
    } as unknown as jest.Mocked<ProfessorAuthRepository>;
    service = new ProfessorAuthService(professorAuthRepository);
    jest.clearAllMocks();
  });

  test("cadastra professor valido com status pendente", async () => {
    professorAuthRepository.buscarPorEmail.mockResolvedValue(null);
    professorAuthRepository.buscarPorSiape.mockResolvedValue(null);
    professorAuthRepository.criar.mockResolvedValue(criarRegistroProfessor());

    const resposta = await service.registrar(inputValido);

    expect(professorAuthRepository.buscarPorEmail).toHaveBeenCalledWith(
      "hilmer@medicina.unb.br",
    );
    expect(professorAuthRepository.buscarPorSiape).toHaveBeenCalledWith("1234567");
    expect(professorAuthRepository.criar).toHaveBeenCalledWith({
      nome: "Hilmer Rodrigues Neri",
      email: "hilmer@medicina.unb.br",
      senhaHash: expect.stringMatching(/^\$2[aby]\$10\$/),
      instituicao: "UnB",
      departamento: "Anatomia",
      curso: "Medicina",
      siape: "1234567",
      papel: "PROFESSOR",
      status: "PENDENTE",
    });
    expect(resposta).toMatchObject({
      id: "professor-1",
      email: "hilmer@medicina.unb.br",
      papel: "PROFESSOR",
      status: "PENDENTE",
      criadoEm: "2026-05-10T10:00:00.000Z",
    });
    expect(resposta).not.toHaveProperty("senha");
  });

  test("rejeita email duplicado", async () => {
    professorAuthRepository.buscarPorEmail.mockResolvedValue({
      id: "professor-1",
      email: "hilmer@medicina.unb.br",
    });

    await expect(service.registrar(inputValido)).rejects.toMatchObject({
      codigoStatus: 409,
      message: MENSAGENS.emailJaCadastrado,
      detalhes: { email: "hilmer@medicina.unb.br" },
    } satisfies Partial<ErroAplicacao>);
    expect(professorAuthRepository.buscarPorSiape).not.toHaveBeenCalled();
    expect(professorAuthRepository.criar).not.toHaveBeenCalled();
  });

  test("rejeita SIAPE duplicado", async () => {
    professorAuthRepository.buscarPorEmail.mockResolvedValue(null);
    professorAuthRepository.buscarPorSiape.mockResolvedValue({
      id: "professor-1",
      siape: "1234567",
    });

    await expect(service.registrar(inputValido)).rejects.toMatchObject({
      codigoStatus: 409,
      message: MENSAGENS.siapeJaCadastrado,
      detalhes: { siape: "1234567" },
    } satisfies Partial<ErroAplicacao>);
    expect(professorAuthRepository.criar).not.toHaveBeenCalled();
  });

  test("converte violacao unica de email durante criacao para conflito", async () => {
    professorAuthRepository.buscarPorEmail.mockResolvedValue(null);
    professorAuthRepository.buscarPorSiape.mockResolvedValue(null);
    professorAuthRepository.criar.mockRejectedValue(criarErroCampoUnico("email"));

    await expect(service.registrar(inputValido)).rejects.toMatchObject({
      codigoStatus: 409,
      message: MENSAGENS.emailJaCadastrado,
    } satisfies Partial<ErroAplicacao>);
  });

  test("converte violacao unica de SIAPE durante criacao para conflito", async () => {
    professorAuthRepository.buscarPorEmail.mockResolvedValue(null);
    professorAuthRepository.buscarPorSiape.mockResolvedValue(null);
    professorAuthRepository.criar.mockRejectedValue(criarErroCampoUnico("siape"));

    await expect(service.registrar(inputValido)).rejects.toMatchObject({
      codigoStatus: 409,
      message: MENSAGENS.siapeJaCadastrado,
    } satisfies Partial<ErroAplicacao>);
  });
});
