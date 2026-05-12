import { Prisma } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { MulterError } from 'multer';

import { logger } from "@/config/logger";
import { MENSAGENS } from "@/shared/constants/mensagens";
import { CodigoDeErro } from "@/shared/errors/codigos-de-erro";
import { ErroAplicacao } from "@/shared/errors/erro-aplicacao";
import type { RespostaApiErro } from "@/shared/types/api.types";

export function middlewareTratamentoErros(
  erro: unknown,
  _request: Request,
  response: Response<RespostaApiErro>,
  next: NextFunction,
) {
  void next;

  if (erro instanceof ErroAplicacao) {
    return response.status(erro.codigoStatus).json({
      erro: {
        codigo: erro.codigo,
        mensagem: erro.message,
        detalhes: erro.detalhes,
      },
    });
  }

  if (erro instanceof Prisma.PrismaClientKnownRequestError) {
    return response.status(400).json({
      erro: {
        codigo: CodigoDeErro.REQUISICAO_INVALIDA,
        mensagem: erro.message,
      },
    });
  }

  if (erro instanceof MulterError && erro.code === "LIMIT_FILE_SIZE") {
    return response.status(400).json({
      erro: {
        codigo: CodigoDeErro.REQUISICAO_INVALIDA, 
        mensagem: "A imagem enviada é muito grande. O tamanho máximo permitido é de 5MB.",
      },
    });
  }

  if (erro instanceof Error && erro.message === "FORMATO_INVALIDO") {
    return response.status(400).json({
      erro: {
        codigo: CodigoDeErro.REQUISICAO_INVALIDA,
        mensagem: "Formato de arquivo inválido. Envie apenas JPEG, PNG ou WEBP.",
      },
    });
  }


  logger.error({ erro }, "Erro nao tratado na aplicacao.");

  return response.status(500).json({
    erro: {
      codigo: CodigoDeErro.ERRO_INTERNO,
      mensagem: MENSAGENS.erroInterno,
    },
  });
}