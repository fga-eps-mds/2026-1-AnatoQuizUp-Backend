import { Router } from "express";

import { validarRequisicao } from "@/shared/middlewares/validacao.middleware";

import { QuestionController } from "./question.controller";
import { QuestionRepository } from "./question.repository";
import { QuestionService } from "./question.service";
import {
  schemaAtualizarQuestao,
  schemaBuscarQuestaoPorId,
  schemaCriarQuestao,
  schemaListarQuestoes,
} from "./question.schemas";

const questionRepository = new QuestionRepository();
const questionService = new QuestionService(questionRepository);
const questionController = new QuestionController(questionService);

const questionRouter = Router();

questionRouter.post("/", validarRequisicao(schemaCriarQuestao), questionController.criar);
questionRouter.get(
  "/",
  validarRequisicao(schemaListarQuestoes, "query"),
  questionController.listar,
);
questionRouter.get(
  "/:id",
  validarRequisicao(schemaBuscarQuestaoPorId, "params"),
  questionController.buscarPorId,
);
questionRouter.put(
  "/:id",
  validarRequisicao(schemaBuscarQuestaoPorId, "params"),
  validarRequisicao(schemaAtualizarQuestao),
  questionController.atualizar,
);
questionRouter.delete(
  "/:id",
  validarRequisicao(schemaBuscarQuestaoPorId, "params"),
  questionController.remover,
);

export { questionRouter };
