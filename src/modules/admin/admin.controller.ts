import type { NextFunction, Request, Response } from "express";

import { MENSAGENS } from "@/shared/constants/mensagens";
import type { RespostaApiSucesso, RespostaPaginada } from "@/shared/types/api.types";

import type {
  AlterarStatusUserDto,
  ContextoAdminDto,
} from "./dto/alterar.status_user.types";
import type { ListarUsersDto, ListarUsersQueryDto } from "./dto/listar.users.types";
import type { RespostaUserDto } from "./dto/resposta.user.types";
import type { AdminService } from "./admin.service";

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

  alterarStatus = async (
    request: Request<{ id: string }, unknown, AlterarStatusUserDto>,
    response: Response<RespostaApiSucesso<RespostaUserDto>>,
    next: NextFunction,
  ) => {
    try {
      const contextoAdmin = this.extrairContextoAdmin(request);
      const usuario = await this.adminService.alterarStatus(
        request.params.id,
        request.body,
        contextoAdmin,
      );

      return response.status(200).json({
        mensagem: MENSAGENS.usuarioStatusAlterado,
        dados: usuario,
      });
    } catch (error) {
      return next(error);
    }
  };

  private extrairContextoAdmin(
    request: Request,
  ): ContextoAdminDto {
    const idHeader = request.headers["x-usuario-id"];
    const perfilHeader = request.headers["x-usuario-perfil"];

    const id = Array.isArray(idHeader) ? idHeader[0] : idHeader ?? null;
    const perfil = Array.isArray(perfilHeader) ? perfilHeader[0] : perfilHeader ?? null;

    return {
      id,
      perfil: perfil === "ADMIN" ? "ADMIN" : null,
    };
  }
}
