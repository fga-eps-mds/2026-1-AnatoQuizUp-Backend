import type { QuestionRepository } from "../../../src/modules/question/question.repository";
import { QuestionService } from "../../../src/modules/question/question.service";
import type { MinioService } from "../../../src/modules/question/minio.service";
import type {
  CriarQuestaoDto,
  RegistroQuestaoCompleta,
} from "../../../src/modules/question/dto/question.types";

import { CodigoDeErro } from "@/shared/errors/codigos-de-erro";

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function criarQuestao(
  overrides: Partial<RegistroQuestaoCompleta> = {},
): RegistroQuestaoCompleta {
  const agora = new Date("2026-05-09T12:00:00.000Z");

  return {
    id: "questao-1",
    enunciado: "Qual estrutura bombeia sangue para a aorta?",
    tipoQuestao: "MULTIPLA_ESCOLHA",
    respostaCorreta: "B",
    saibaMais:
      "O ventriculo esquerdo impulsiona sangue para a circulacao sistemica.",
    status: "ATIVO",
    feitoPorIa: false,
    urlImagem: "https://cdn.example.com/coracao.png",
    criadoPorId: "professor-1",
    temaId: "tema-1",
    questaoOriginalId: null,
    criadoEm: agora,
    atualizadoEm: agora,
    excluidoEm: null,

    tema: {
      id: "tema-1",
      nome: "Sistema cardiovascular",
      criadoEm: agora,
      atualizadoEm: agora,
      excluidoEm: null,
    },

    alternativas: {
      id: "alternativas-1",
      alternativaA: "Atrio direito",
      alternativaB: "Ventriculo esquerdo",
      alternativaC: "Atrio esquerdo",
      alternativaD: "Ventriculo direito",
      alternativaE: "Veia cava",
      questaoId: "questao-1",
      criadoEm: agora,
      atualizadoEm: agora,
      excluidoEm: null,
    },

    ...overrides,
  };
}

function criarInputValido(): CriarQuestaoDto {
  return {
    tema: "Sistema cardiovascular",
    enunciado: "Qual estrutura bombeia sangue para a aorta?",
    tipo: "MULTIPLA_ESCOLHA",
    imagem: "https://cdn.example.com/coracao.png",
    alternativaCorreta: "B",
    explicacaoPedagogica:
      "O ventriculo esquerdo impulsiona sangue para a circulacao sistemica.",

    alternativas: {
      A: "Atrio direito",
      B: "Ventriculo esquerdo",
      C: "Atrio esquerdo",
      D: "Ventriculo direito",
      E: "Veia cava",
    },
  };
}

function criarRepositoryMock(): jest.Mocked<QuestionRepository> {
  return {
    listar: jest.fn(),
    buscarPorId: jest.fn(),
    criar: jest.fn(),
    atualizar: jest.fn(),
    desativar: jest.fn(),
    filtrar: jest.fn(),
  } as unknown as jest.Mocked<QuestionRepository>;
}

function criarMinioServiceMock(): jest.Mocked<MinioService> {
  return {
    uploadImagem: jest.fn(),
  } as unknown as jest.Mocked<MinioService>;
}

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

describe("QuestionService", () => {
  let repository: jest.Mocked<QuestionRepository>;
  let minioService: jest.Mocked<MinioService>;
  let service: QuestionService;

  const imagemMock = {
    fieldname: "imagem",
    originalname: "femur.jpeg",
    encoding: "7bit",
    mimetype: "image/jpeg",
    buffer: Buffer.from("arquivo-fake-binario"),
    size: 1024,
  } as Express.Multer.File;

  beforeEach(() => {
    jest.clearAllMocks();

    repository = criarRepositoryMock();
    minioService = criarMinioServiceMock();

    service = new QuestionService(repository, minioService);
  });

  // ---------------------------------------------------------------------------
  // CREATE
  // ---------------------------------------------------------------------------

  test("cria questao de multipla escolha valida com imagem", async () => {
    const input = criarInputValido();

    delete input.imagem;

    const urlFake = "https://minio/foto-salva.png";

    minioService.uploadImagem.mockResolvedValue(urlFake);

    repository.criar.mockResolvedValue(
      criarQuestao({
        urlImagem: urlFake,
      }),
    );

    const resposta = await service.criar(
      input,
      imagemMock,
      "professor-1",
    );

    expect(minioService.uploadImagem).toHaveBeenCalledTimes(1);

    expect(minioService.uploadImagem).toHaveBeenCalledWith(
      imagemMock,
    );

    expect(repository.criar).toHaveBeenCalledWith(
      expect.objectContaining({
        imagem: urlFake,
      }),
      "professor-1",
    );

    expect(resposta.tipo).toBe("MULTIPLA_ESCOLHA");
  });

  test("cria questao de verdadeiro/falso valida", async () => {
    const input = criarInputValido();

    input.tipo = "VERDADEIRO_FALSO";
    input.alternativaCorreta = "E";

    repository.criar.mockResolvedValue(
      criarQuestao({
        tipoQuestao: "CERTO_ERRADO",
      }),
    );

    const resposta = await service.criar(
      input,
      undefined,
      "professor-1",
    );

    expect(minioService.uploadImagem).not.toHaveBeenCalled();

    expect(repository.criar).toHaveBeenCalledWith(
      input,
      "professor-1",
    );

    expect(resposta.tipo).toBe("VERDADEIRO_FALSO");
  });

  test("impede criacao sem alternativas", async () => {
    const input = {
      ...criarInputValido(),
      alternativas: {},
    } as CriarQuestaoDto;

    await expect(
      service.criar(input, undefined, "professor-1"),
    ).rejects.toMatchObject({
      codigoStatus: 400,
      codigo: CodigoDeErro.ERRO_DE_VALIDACAO,
    });

    expect(repository.criar).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------------------------------
  // UPDATE
  // ---------------------------------------------------------------------------

  test("atualiza questao substituindo a imagem", async () => {
    const questaoExistente = criarQuestao();

    const novaUrl = "https://minio/nova-foto.png";

    repository.buscarPorId.mockResolvedValue(
      questaoExistente,
    );

    minioService.uploadImagem.mockResolvedValue(
      novaUrl,
    );

    repository.atualizar.mockResolvedValue(
      criarQuestao({
        urlImagem: novaUrl,
      }),
    );

    const resposta = await service.atualizar(
      "questao-1",
      {
        enunciado: "Nova foto",
      },
      imagemMock,
      "user-123",
    );

    expect(repository.buscarPorId).toHaveBeenCalledWith(
      "questao-1",
    );

    expect(minioService.uploadImagem).toHaveBeenCalledTimes(
      1,
    );

    expect(minioService.uploadImagem).toHaveBeenCalledWith(
      imagemMock,
    );

    expect(repository.atualizar).toHaveBeenCalledWith(
      "questao-1",
      expect.objectContaining({
        imagem: novaUrl,
      }),
      "user-123",
    );

    expect(resposta).toBeDefined();
  });

  // ---------------------------------------------------------------------------
  // DELETE
  // ---------------------------------------------------------------------------

  test("remove questao com soft delete", async () => {
    repository.buscarPorId.mockResolvedValue(
      criarQuestao(),
    );

    repository.desativar.mockResolvedValue(
      criarQuestao({
        status: "INATIVO",
      }),
    );

    const resposta = await service.remover(
      "questao-1",
    );

    expect(repository.buscarPorId).toHaveBeenCalledWith(
      "questao-1",
    );

    expect(repository.desativar).toHaveBeenCalledWith(
      "questao-1",
    );

    expect(resposta.status).toBe("INATIVO");
  });
});