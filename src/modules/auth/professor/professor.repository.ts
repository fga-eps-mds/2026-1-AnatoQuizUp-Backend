import { randomUUID } from "node:crypto";

import { prisma } from "@/config/db";
import type { RegistroProfessor } from "@/modules/auth/professor/dto/resposta.professor.types";
import type { Papel, StatusUsuario } from "@/shared/constants/papeis";

export type CriarProfessorData = {
  nome: string;
  email: string;
  senhaHash: string;
  instituicao: string;
  departamento: string;
  curso: string;
  siape: string;
  papel: Papel;
  status: StatusUsuario;
};

type ProfessorPorEmail = {
  id: string;
  email: string;
};

type ProfessorPorSiape = {
  id: string;
  siape: string;
};

type RegistroProfessorBanco = {
  id: string;
  nome: string;
  email: string;
  instituicao: string | null;
  departamento: string | null;
  curso: string | null;
  siape: string | null;
  perfil: Papel;
  status: StatusUsuario;
  criadoEm: Date;
  atualizadoEm: Date;
};

function converterRegistroBanco(registro: RegistroProfessorBanco): RegistroProfessor {
  return {
    id: registro.id,
    nome: registro.nome,
    email: registro.email,
    instituicao: registro.instituicao,
    departamento: registro.departamento,
    curso: registro.curso,
    siape: registro.siape,
    papel: registro.perfil,
    status: registro.status,
    criadoEm: registro.criadoEm,
    atualizadoEm: registro.atualizadoEm,
  };
}

export class ProfessorAuthRepository {
  async buscarPorEmail(email: string): Promise<ProfessorPorEmail | null> {
    const registros = await prisma.$queryRaw<ProfessorPorEmail[]>`
      SELECT id, email
      FROM usuarios
      WHERE email = ${email}
      LIMIT 1
    `;

    return registros[0] ?? null;
  }

  async buscarPorSiape(siape: string): Promise<ProfessorPorSiape | null> {
    const registros = await prisma.$queryRaw<ProfessorPorSiape[]>`
      SELECT id, siape
      FROM usuarios
      WHERE siape = ${siape}
      LIMIT 1
    `;

    return registros[0] ?? null;
  }

  async criar(data: CriarProfessorData): Promise<RegistroProfessor> {
    const id = randomUUID();

    const registros = await prisma.$queryRaw<RegistroProfessorBanco[]>`
      INSERT INTO usuarios (
        id,
        nome,
        email,
        senha,
        perfil,
        status,
        instituicao,
        departamento,
        curso,
        siape,
        "criadoEm",
        "atualizadoEm"
      )
      VALUES (
        ${id},
        ${data.nome},
        ${data.email},
        ${data.senhaHash},
        ${data.papel}::"PerfilUsuario",
        ${data.status}::"StatusUsuario",
        ${data.instituicao},
        ${data.departamento},
        ${data.curso},
        ${data.siape},
        NOW(),
        NOW()
      )
      RETURNING
        id,
        nome,
        email,
        instituicao,
        departamento,
        curso,
        siape,
        perfil,
        status,
        "criadoEm",
        "atualizadoEm"
    `;

    return converterRegistroBanco(registros[0]);
  }
}
