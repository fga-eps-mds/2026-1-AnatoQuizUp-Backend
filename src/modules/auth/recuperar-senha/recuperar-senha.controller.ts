import type { NextFunction, Request, Response } from "express";

import type { RecuperarSenhaService } from "@/modules/auth/recuperar-senha/recuperar-senha.service";
import type {
  RedefinirSenhaDto,
  SolicitarRecuperacaoSenhaDto,
} from "@/modules/auth/recuperar-senha/recuperar-senha.schemas";
import { MENSAGENS } from "@/shared/constants/mensagens";
import type { RespostaApiSucesso } from "@/shared/types/api.types";

export class RecuperarSenhaController {
  constructor(private readonly recuperarSenhaService: RecuperarSenhaService) {}

  forgotPassword = async (
    request: Request<unknown, unknown, SolicitarRecuperacaoSenhaDto>,
    response: Response<RespostaApiSucesso<null>>,
    next: NextFunction,
  ) => {
    try {
      await this.recuperarSenhaService.forgotPassword(request.body);

      return response.status(200).json({
        mensagem: MENSAGENS.instrucoesRecuperacaoSenhaEnviadas,
        dados: null,
      });
    } catch (error) {
      return next(error);
    }
  };

  resetPassword = async (
    request: Request<unknown, unknown, RedefinirSenhaDto>,
    response: Response<RespostaApiSucesso<null>>,
    next: NextFunction,
  ) => {
    try {
      await this.recuperarSenhaService.resetPassword(request.body);

      return response.status(200).json({
        mensagem: MENSAGENS.senhaRedefinida,
        dados: null,
      });
    } catch (error) {
      return next(error);
    }
  };
}
