import type { NextFunction, Request, Response } from "express";

import type {
  LoginDto,
  LogoutDto,
  RefreshTokenDto,
  RespostaLoginDto,
  RespostaRenovarSessaoDto,
  RespostaUsuarioAutenticadoDto,
} from "@/modules/auth/sessao/dto/login.types";
import type { SessaoService } from "@/modules/auth/sessao/sessao.service";
import { MENSAGENS } from "@/shared/constants/mensagens";
import { CodigoDeErro } from "@/shared/errors/codigos-de-erro";
import { ErroAplicacao } from "@/shared/errors/erro-aplicacao";
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

  renovarSessao = async (
    request: Request<unknown, unknown, RefreshTokenDto>,
    response: Response<RespostaApiSucesso<RespostaRenovarSessaoDto>>,
    next: NextFunction,
  ) => {
    try {
      const dados = await this.sessaoService.renovarSessao(request.body);

      return response.status(200).json({
        mensagem: MENSAGENS.sessaoRenovada,
        dados,
      });
    } catch (error) {
      return next(error);
    }
  };

  logout = async (
    request: Request<unknown, unknown, LogoutDto>,
    response: Response<void>,
    next: NextFunction,
  ) => {
    try {
      if (!request.usuario) {
        throw new ErroAplicacao({
          codigoStatus: 401,
          codigo: CodigoDeErro.TOKEN_INVALIDO,
          mensagem: MENSAGENS.tokenInvalido,
        });
      }

      await this.sessaoService.logout(request.usuario.id, request.body);

      return response.status(204).send();
    } catch (error) {
      return next(error);
    }
  };

  obterUsuarioAutenticado = async (
    request: Request,
    response: Response<RespostaApiSucesso<RespostaUsuarioAutenticadoDto>>,
    next: NextFunction,
  ) => {
    try {
      if (!request.usuario) {
        throw new ErroAplicacao({
          codigoStatus: 401,
          codigo: CodigoDeErro.TOKEN_INVALIDO,
          mensagem: MENSAGENS.tokenInvalido,
        });
      }

      const dados = await this.sessaoService.obterUsuarioAutenticado(request.usuario.id);

      return response.status(200).json({
        mensagem: MENSAGENS.usuarioAutenticadoEncontrado,
        dados,
      });
    } catch (error) {
      return next(error);
    }
  };
}
