import type { NextFunction, Request, Response } from "express";

import type { OpcoesAcademicasAlunoDto } from "@/modules/auth/aluno/opcoes-academicas/dto/resposta.opcoes-academicas.types";
import type { AlunoOpcoesAcademicasService } from "@/modules/auth/aluno/opcoes-academicas/opcoes-academicas.service";
import { MENSAGENS } from "@/shared/constants/mensagens";
import type { RespostaApiSucesso } from "@/shared/types/api.types";

export class AlunoOpcoesAcademicasController {
  constructor(private readonly opcoesAcademicasService: AlunoOpcoesAcademicasService) {}

  listarOpcoesAcademicas = async (
    _request: Request,
    response: Response<RespostaApiSucesso<OpcoesAcademicasAlunoDto>>,
    next: NextFunction,
  ) => {
    try {
      return response.status(200).json({
        mensagem: MENSAGENS.opcoesAcademicasListadas,
        dados: this.opcoesAcademicasService.listarOpcoesAcademicas(),
      });
    } catch (error) {
      return next(error);
    }
  };
}

