import type { NextFunction, Request, Response } from "express";

import type {
  AlunoAuthService,
  RespostaDisponibilidadeNicknameDto,
} from "@/modules/auth/aluno/aluno.service";
import type {
  DisponibilidadeNicknameAlunoDto,
  RegistrarAlunoDto,
} from "@/modules/auth/aluno/dto/registrar.aluno.types";
import type { RespostaAlunoDto } from "@/modules/auth/aluno/dto/resposta.aluno.types";
import { MENSAGENS } from "@/shared/constants/mensagens";
import type { RespostaApiSucesso } from "@/shared/types/api.types";

export class AlunoAuthController {
  constructor(private readonly alunoAuthService: AlunoAuthService) {}

  verificarNicknameDisponivel = async (
    request: Request<unknown, unknown, unknown, DisponibilidadeNicknameAlunoDto>,
    response: Response<RespostaApiSucesso<RespostaDisponibilidadeNicknameDto>>,
    next: NextFunction,
  ) => {
    try {
      const disponibilidade = await this.alunoAuthService.verificarNicknameDisponivel(
        request.query,
      );

      return response.status(200).json({
        mensagem: MENSAGENS.nicknameDisponivel,
        dados: disponibilidade,
      });
    } catch (error) {
      return next(error);
    }
  };

  registrar = async (
    request: Request<unknown, unknown, RegistrarAlunoDto>,
    response: Response<RespostaApiSucesso<RespostaAlunoDto>>,
    next: NextFunction,
  ) => {
    try {
      const aluno = await this.alunoAuthService.registrar(request.body);

      return response.status(201).json({
        mensagem: MENSAGENS.usuarioCadastrado,
        dados: aluno,
      });
    } catch (error) {
      return next(error);
    }
  };
}
