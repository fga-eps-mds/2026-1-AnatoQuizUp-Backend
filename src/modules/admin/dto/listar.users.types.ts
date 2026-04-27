import type { Usuario } from "@prisma/client";

export type ListarUsersDto = Omit<Usuario, "senha">;

export type ListarUsersQueryDto = {
  page?: number;
  limit?: number;
};
