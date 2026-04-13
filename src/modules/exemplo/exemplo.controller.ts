import type { NextFunction, Request, Response } from "express";

import { MENSAGENS } from "@/shared/constants/mensagens";
import type { ExemploService } from "@/modules/exemplo/exemplo.service";
import type { CriarExemploDto } from "@/modules/exemplo/dto/criar.exemplo.types";
import type { ListarExemplosDto } from "@/modules/exemplo/dto/listar.exemplos.types";
import type { RespostaExemploDto } from "@/modules/exemplo/dto/resposta.exemplo.types";
import type { RespostaApiSucesso, RespostaPaginada } from "@/shared/types/api.types";

export class ExemploController {
  constructor(private readonly exemploService: ExemploService) {}

  criar = async (
    request: Request<unknown, unknown, CriarExemploDto>,
    response: Response<RespostaApiSucesso<RespostaExemploDto>>,
    next: NextFunction,
  ) => {
    try {
      const exemplo = await this.exemploService.criar(request.body);

      return response.status(201).json({
        mensagem: MENSAGENS.exemploCriado,
        dados: exemplo,
      });
    } catch (error) {
      return next(error);
    }
  };

  listar = async (
    request: Request<unknown, unknown, unknown, ListarExemplosDto>,
    response: Response<RespostaPaginada<RespostaExemploDto>>,
    next: NextFunction,
  ) => {
    try {
      const exemplos = await this.exemploService.listar(request.query);

      return response.status(200).json(exemplos);
    } catch (error) {
      return next(error);
    }
  };

  buscarPorId = async (
    request: Request<{ id: string }>,
    response: Response<RespostaApiSucesso<RespostaExemploDto>>,
    next: NextFunction,
  ) => {
    try {
      const exemplo = await this.exemploService.buscarPorId(request.params.id);

      return response.status(200).json({
        mensagem: MENSAGENS.exemploEncontrado,
        dados: exemplo,
      });
    } catch (error) {
      return next(error);
    }
  };
}
