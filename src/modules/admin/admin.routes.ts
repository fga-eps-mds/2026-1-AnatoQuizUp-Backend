import { Router } from "express";

import { validarRequisicao } from "@/shared/middlewares/validacao.middleware";

import { AdminService } from "./admin.service";
import { AdminController } from "./admin.controller";
import { UserRepository } from "./admin.repository";
import { schemaListarUsers } from "./admin.schemas";

const userRepository = new UserRepository();
const adminService = new AdminService(userRepository);
const adminController = new AdminController(adminService);

const adminRouter = Router();

adminRouter.get("/users", validarRequisicao(schemaListarUsers, "query"), adminController.listar);
export { adminRouter };
