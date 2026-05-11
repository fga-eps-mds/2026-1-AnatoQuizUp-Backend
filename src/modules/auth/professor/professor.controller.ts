import type { NextFunction, Request, Response } from "express";

import type { RegistrarProfessorDto } from "@/modules/auth/professor/dto/registrar.professor.types";
import type { RespostaProfessorDto } from "@/modules/auth/professor/dto/resposta.professor.types";
import type { ProfessorAuthService } from "@/modules/auth/professor/professor.service";
import { MENSAGENS } from "@/shared/constants/mensagens";
import type { RespostaApiSucesso } from "@/shared/types/api.types";

export class ProfessorAuthController {
  constructor(private readonly professorAuthService: ProfessorAuthService) {}

  registrar = async (
    request: Request<unknown, unknown, RegistrarProfessorDto>,
    response: Response<RespostaApiSucesso<{ usuario: RespostaProfessorDto }>>,
    next: NextFunction,
  ) => {
    try {
      const professor = await this.professorAuthService.registrar(request.body);

      return response.status(201).json({
        mensagem: MENSAGENS.professorCadastradoPendente,
        dados: {
          usuario: professor,
        },
      });
    } catch (error) {
      return next(error);
    }
  };
}
