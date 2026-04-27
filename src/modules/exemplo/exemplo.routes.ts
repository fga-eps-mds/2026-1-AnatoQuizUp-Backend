import { Router } from "express";

import { ExemploController } from "@/modules/exemplo/exemplo.controller";
import {
  schemaBuscarPorIdExemplo,
  schemaCriarExemplo,
  schemaListarExemplos,
} from "@/modules/exemplo/exemplo.schemas";
import { ExemploRepository } from "@/modules/exemplo/exemplo.repository";
import { ExemploService } from "@/modules/exemplo/exemplo.service";
import { validarRequisicao } from "@/shared/middlewares/validacao.middleware";

const exemploRepository = new ExemploRepository();
const exemploService = new ExemploService(exemploRepository);
const exemploController = new ExemploController(exemploService);

const exemploRouter = Router();

exemploRouter.post("/", validarRequisicao(schemaCriarExemplo), exemploController.criar);
exemploRouter.get("/", validarRequisicao(schemaListarExemplos, "query"), exemploController.listar);
exemploRouter.get(
  "/:id",
  validarRequisicao(schemaBuscarPorIdExemplo, "params"),
  exemploController.buscarPorId,
);

export { exemploRouter };
