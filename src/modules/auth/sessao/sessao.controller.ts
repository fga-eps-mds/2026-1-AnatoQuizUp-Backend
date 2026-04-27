import type { NextFunction, Request, Response } from "express";

import type { LoginDto, RespostaLoginDto } from "@/modules/auth/sessao/dto/login.types";
import type { SessaoService } from "@/modules/auth/sessao/sessao.service";
import { MENSAGENS } from "@/shared/constants/mensagens";
import type { RespostaApiSucesso } from "@/shared/types/api.types";

export class SessaoController {
  constructor(private readonly sessaoService: SessaoService) {}

  login = async (
    request: Request<unknown, unknown, LoginDto>,
    response: Response<RespostaApiSucesso<RespostaLoginDto>>,
    next: NextFunction,
  ) => {
    try {
      const dados = await this.sessaoService.login(request.body);

      return response.status(200).json({
        mensagem: MENSAGENS.loginRealizado,
        dados,
      });
    } catch (error) {
      return next(error);
    }
  };
}
