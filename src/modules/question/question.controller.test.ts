import type { NextFunction, Request, Response } from "express";

import { MENSAGENS } from "@/shared/constants/mensagens";
import type { RespostaApiSucesso, RespostaPaginada } from "@/shared/types/api.types";

import { QuestionController } from "./question.controller";
import type { QuestionService } from "./question.service";
import type {
  CriarQuestaoDto,
  ListarQuestoesQueryDto,
  RespostaQuestaoDto,
} from "./dto/question.types";

function criarQuestaoResposta(): RespostaQuestaoDto {
  return {
    id: "questao-1",
    tema: { id: "tema-1", nome: "Anatomia" },
    enunciado: "Enunciado",
    tipo: "MULTIPLA_ESCOLHA",
    imagem: null,
    alternativaCorreta: "A",
    explicacaoPedagogica: "Explicacao",
    alternativas: {
      A: "A",
      B: "B",
      C: "C",
      D: "D",
      E: "E",
    },
    status: "ATIVO",
    criadoPorId: "professor-1",
    criadoEm: "2026-05-09T12:00:00.000Z",
    atualizadoEm: "2026-05-09T12:00:00.000Z",
    excluidoEm: null,
  };
}

function criarResponseMock<T>() {
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));

  return {
    response: { status } as unknown as Response<T>,
    status,
    json,
  };
}

describe("QuestionController", () => {
  const next = jest.fn() as NextFunction;
  let questionService: jest.Mocked<QuestionService>;
  let controller: QuestionController;

  beforeEach(() => {
    questionService = {
      listar: jest.fn(),
      buscarPorId: jest.fn(),
      criar: jest.fn(),
      atualizar: jest.fn(),
      remover: jest.fn(),
    } as unknown as jest.Mocked<QuestionService>;
    controller = new QuestionController(questionService);
    jest.clearAllMocks();
  });

  test("criar responde 201 com mensagem e dados", async () => {
    const questao = criarQuestaoResposta();
    questionService.criar.mockResolvedValue(questao);
    const body: CriarQuestaoDto = {
      tema: "Anatomia",
      enunciado: "Enunciado",
      tipo: "MULTIPLA_ESCOLHA",
      imagem: "https://cdn.example.com/imagem.png",
      alternativaCorreta: "A",
      explicacaoPedagogica: "Explicacao",
      alternativas: { A: "A", B: "B", C: "C", D: "D", E: "E" },
    };
    const request = {
      body,
      usuario: { id: "professor-1" },
    } as Request<unknown, unknown, CriarQuestaoDto>;
    const { response, status, json } = criarResponseMock<RespostaApiSucesso<RespostaQuestaoDto>>();

    await controller.criar(request, response, next);

    expect(questionService.criar).toHaveBeenCalledWith(body, "professor-1");
    expect(status).toHaveBeenCalledWith(201);
    expect(json).toHaveBeenCalledWith({
      mensagem: MENSAGENS.questaoCriada,
      dados: questao,
    });
  });

  test("listar responde com questoes paginadas", async () => {
    const resposta: RespostaPaginada<RespostaQuestaoDto> = {
      dados: [criarQuestaoResposta()],
      metadados: { page: 1, limit: 10, total: 1, totalPages: 1 },
    };
    questionService.listar.mockResolvedValue(resposta);
    const request = {
      query: { page: 1, limit: 10 },
    } as Request<unknown, unknown, unknown, ListarQuestoesQueryDto>;
    const { response, status, json } = criarResponseMock<RespostaPaginada<RespostaQuestaoDto>>();

    await controller.listar(request, response, next);

    expect(questionService.listar).toHaveBeenCalledWith({ page: 1, limit: 10 });
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(resposta);
  });

  test("buscarPorId responde com questao encontrada", async () => {
    const questao = criarQuestaoResposta();
    questionService.buscarPorId.mockResolvedValue(questao);
    const request = { params: { id: "questao-1" } } as Request<{ id: string }>;
    const { response, status, json } = criarResponseMock<RespostaApiSucesso<RespostaQuestaoDto>>();

    await controller.buscarPorId(request, response, next);

    expect(questionService.buscarPorId).toHaveBeenCalledWith("questao-1");
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      mensagem: MENSAGENS.questaoEncontrada,
      dados: questao,
    });
  });

  test("atualizar encaminha id e body para o service", async () => {
    const questao = criarQuestaoResposta();
    questionService.atualizar.mockResolvedValue(questao);
    const request = {
      params: { id: "questao-1" },
      body: { enunciado: "Novo enunciado" },
    } as Request<{ id: string }>;
    const { response, status, json } = criarResponseMock<RespostaApiSucesso<RespostaQuestaoDto>>();

    await controller.atualizar(request, response, next);

    expect(questionService.atualizar).toHaveBeenCalledWith("questao-1", {
      enunciado: "Novo enunciado",
    });
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      mensagem: MENSAGENS.questaoAtualizada,
      dados: questao,
    });
  });

  test("remover responde questao desativada", async () => {
    const questao = criarQuestaoResposta();
    questionService.remover.mockResolvedValue(questao);
    const request = { params: { id: "questao-1" } } as Request<{ id: string }>;
    const { response, status, json } = criarResponseMock<RespostaApiSucesso<RespostaQuestaoDto>>();

    await controller.remover(request, response, next);

    expect(questionService.remover).toHaveBeenCalledWith("questao-1");
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      mensagem: MENSAGENS.questaoRemovida,
      dados: questao,
    });
  });

  test("encaminha erro do service para middleware", async () => {
    const erro = new Error("falha");
    questionService.buscarPorId.mockRejectedValue(erro);
    const request = { params: { id: "questao-1" } } as Request<{ id: string }>;
    const { response } = criarResponseMock<RespostaApiSucesso<RespostaQuestaoDto>>();

    await controller.buscarPorId(request, response, next);

    expect(next).toHaveBeenCalledWith(erro);
  });
});
