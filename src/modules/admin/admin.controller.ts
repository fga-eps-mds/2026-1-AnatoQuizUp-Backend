import type { NextFunction, Request, Response } from "express";

import type { RespostaPaginada } from "@/shared/types/api.types";

import type { ListarUsersDto, ListarUsersQueryDto } from "./dto/listar.users.types";
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
}
