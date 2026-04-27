import type { NextFunction, Request, Response } from "express";

import type { NacionalidadesAlunoDto } from "@/modules/auth/aluno/nacionalidades/dto/resposta.nacionalidade.types";
import type { AlunoNacionalidadesService } from "@/modules/auth/aluno/nacionalidades/nacionalidades.service";
import { MENSAGENS } from "@/shared/constants/mensagens";
import type { RespostaApiSucesso } from "@/shared/types/api.types";

export class AlunoNacionalidadesController {
  constructor(private readonly nacionalidadesService: AlunoNacionalidadesService) {}

  listarNacionalidades = async (
    _request: Request,
    response: Response<RespostaApiSucesso<NacionalidadesAlunoDto>>,
    next: NextFunction,
  ) => {
    try {
      return response.status(200).json({
        mensagem: MENSAGENS.nacionalidadesListadas,
        dados: this.nacionalidadesService.listarNacionalidades(),
      });
    } catch (error) {
      return next(error);
    }
  };
}
