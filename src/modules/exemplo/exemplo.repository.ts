import { randomUUID } from "node:crypto";

import { prisma } from "@/config/db";
import type { CriarExemploDto } from "@/modules/exemplo/dto/criar.exemplo.types";
import type { ParametrosPaginacao } from "@/shared/utils/paginacao.util";

type RegistroExemplo = {
  id: string;
  nome: string;
  descricao: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class ExemploRepository {
  async criar(data: CriarExemploDto) {
    const id = randomUUID();

    const registros = await prisma.$queryRaw<RegistroExemplo[]>`
      INSERT INTO exemplos (id, nome, descricao, "createdAt", "updatedAt")
      VALUES (${id}, ${data.nome}, ${data.descricao ?? null}, NOW(), NOW())
      RETURNING id, nome, descricao, "createdAt", "updatedAt"
    `;

    return registros[0];
  }

  async listar(paginacao: ParametrosPaginacao) {
    const consultaListagem = prisma.$queryRaw<RegistroExemplo[]>`
      SELECT id, nome, descricao, "createdAt", "updatedAt"
      FROM exemplos
      ORDER BY "createdAt" DESC
      LIMIT ${paginacao.limit}
      OFFSET ${paginacao.skip}
    `;

    const consultaTotal = prisma.$queryRaw<Array<{ total: bigint }>>`
      SELECT COUNT(*)::bigint AS total
      FROM exemplos
    `;

    const [data, totalResultado] = await prisma.$transaction([consultaListagem, consultaTotal]);

    return {
      data,
      total: Number(totalResultado[0]?.total ?? 0n),
    };
  }

  async buscarPorId(id: string) {
    const registros = await prisma.$queryRaw<RegistroExemplo[]>`
      SELECT id, nome, descricao, "createdAt", "updatedAt"
      FROM exemplos
      WHERE id = ${id}
      LIMIT 1
    `;

    return registros[0] ?? null;
  }
}
