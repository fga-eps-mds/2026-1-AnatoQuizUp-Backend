import { Router } from "express";

import { AlunoLocalidadesController } from "@/modules/auth/aluno/localidades/localidades.controller";
import { schemaBuscarCidadesPorUf } from "@/modules/auth/aluno/localidades/localidades.schemas";
import { AlunoLocalidadesService } from "@/modules/auth/aluno/localidades/localidades.service";
import { validarRequisicao } from "@/shared/middlewares/validacao.middleware";

const localidadesService = new AlunoLocalidadesService();
const localidadesController = new AlunoLocalidadesController(localidadesService);

const alunoLocalidadesRouter = Router();

alunoLocalidadesRouter.get("/estados", localidadesController.listarEstados);
alunoLocalidadesRouter.get(
  "/estados/:uf/cidades",
  validarRequisicao(schemaBuscarCidadesPorUf, "params"),
  localidadesController.listarCidadesPorUf,
);

export { alunoLocalidadesRouter };
