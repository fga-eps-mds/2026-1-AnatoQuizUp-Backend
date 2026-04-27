import type { NextFunction, Request, Response } from "express";

import { MENSAGENS } from "@/shared/constants/mensagens";
import type { RespostaApiSucesso, RespostaPaginada } from "@/shared/types/api.types";

import type { ListarUsersDto, ListarUsersQueryDto } from "./dto/listar.users.types";
import type { RespostaUserDto } from "./dto/resposta.user.types";
import { AdminService } from "./admin.service";

export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  listar = async (
    request: Request<unknown, unknown, unknown, ListarUsersQueryDto>,
    response: Response<RespostaPaginada<ListarUsersDto>>,
    next: NextFunction,
  ) => {
    try {
      const admin = await this.adminService.listar(request.query);

      return response.status(200).json(admin);
    } catch (error) {
      return next(error);
    }
  };

  buscarPorId = async (
    request: Request<{ id: string }>,
    response: Response<RespostaApiSucesso<RespostaUserDto>>,
    next: NextFunction,
  ) => {
    try {
      const usuario = await this.adminService.buscarPorId(request.params.id);

      return response.status(200).json({
        mensagem: MENSAGENS.usuarioEncontrado,
        dados: usuario,
      });
    } catch (error) {
      return next(error);
    }
  };
}
