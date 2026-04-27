import { prisma } from "@/config/db";
import type { StatusUsuario } from "@prisma/client";
import type { ListarUsersDto } from "@/modules/admin/dto/listar.users.types";
import type { ParametrosPaginacao } from "@/shared/utils/paginacao.util";

export class UserRepository {
  async listar(paginacao: ParametrosPaginacao) {
    const [data, total] = await prisma.$transaction([
      prisma.usuario.findMany({
        omit: { senha: true },
        skip: paginacao.skip,
        take: paginacao.limit,
        orderBy: {
          criadoEm: "desc",
        },
      }),
      prisma.usuario.count(),
    ]);

    return {
      data: data as ListarUsersDto[],
      total,
    };
  }

  async buscarPorId(id: string) {
    return prisma.usuario.findUnique({
      where: { id },
      omit: { senha: true },
    });
  }

  async atualizarStatus(id: string, status: StatusUsuario, aprovadoPorId?: string) {
    return prisma.usuario.update({
      where: { id },
      data: {
        status,
        ...(aprovadoPorId
          ? {
              aprovadoPorId,
              aprovadoEm: new Date(),
            }
          : {}),
      },
      omit: { senha: true },
    });
  }
}
