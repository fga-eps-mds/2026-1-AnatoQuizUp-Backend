import type { NextFunction, Request, Response } from "express";

import { MENSAGENS } from "@/shared/constants/mensagens";
import type { RespostaApiSucesso, RespostaPaginada } from "@/shared/types/api.types";

import type {
  AtualizarQuestaoDto,
  CriarQuestaoDto,
  ListarQuestoesQueryDto,
  RespostaQuestaoDto,
} from "./dto/question.types";
import type { QuestionService } from "./question.service";

export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  listar = async (
    request: Request<unknown, unknown, unknown, ListarQuestoesQueryDto>,
    response: Response<RespostaPaginada<RespostaQuestaoDto>>,
    next: NextFunction,
  ) => {
    try {
      const questoes = await this.questionService.listar(request.query);

      return response.status(200).json(questoes);
    } catch (error) {
      return next(error);
    }
  };

  buscarPorId = async (
    request: Request<{ id: string }>,
    response: Response<RespostaApiSucesso<RespostaQuestaoDto>>,
    next: NextFunction,
  ) => {
    try {
      const questao = await this.questionService.buscarPorId(request.params.id);

      return response.status(200).json({
        mensagem: MENSAGENS.questaoEncontrada,
        dados: questao,
      });
    } catch (error) {
      return next(error);
    }
  };

  criar = async (
    request: Request<unknown, unknown, CriarQuestaoDto>,
    response: Response<RespostaApiSucesso<RespostaQuestaoDto>>,
    next: NextFunction,
  ) => {
    try {
      const questao = await this.questionService.criar(request.body, request.usuario?.id ?? "");

      return response.status(201).json({
        mensagem: MENSAGENS.questaoCriada,
        dados: questao,
      });
    } catch (error) {
      return next(error);
    }
  };

  atualizar = async (
    request: Request<{ id: string }, unknown, AtualizarQuestaoDto>,
    response: Response<RespostaApiSucesso<RespostaQuestaoDto>>,
    next: NextFunction,
  ) => {
    try {
      const questao = await this.questionService.atualizar(request.params.id, request.body);

      return response.status(200).json({
        mensagem: MENSAGENS.questaoAtualizada,
        dados: questao,
      });
    } catch (error) {
      return next(error);
    }
  };

  remover = async (
    request: Request<{ id: string }>,
    response: Response<RespostaApiSucesso<RespostaQuestaoDto>>,
    next: NextFunction,
  ) => {
    try {
      const questao = await this.questionService.remover(request.params.id);

      return response.status(200).json({
        mensagem: MENSAGENS.questaoRemovida,
        dados: questao,
      });
    } catch (error) {
      return next(error);
    }
  };
}
