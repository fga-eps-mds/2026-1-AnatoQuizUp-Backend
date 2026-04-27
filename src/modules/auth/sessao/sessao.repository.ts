import { randomUUID } from "node:crypto";

import { prisma } from "@/config/db";
import { VALOR_NAO_SE_APLICA } from "@/modules/auth/aluno/aluno.constants";
import type { Papel } from "@/shared/constants/papeis";
import { PAPEIS } from "@/shared/constants/papeis";
import type { Status } from "@/shared/constants/status";

type PerfilBanco = "ALUNO" | "PROFESSOR" | "ADMIN";

export type UsuarioSessao = {
  id: string;
  nome: string;
  nickname: string | null;
  email: string;
  senhaHash: string;
  papel: Papel;
  status: Status;
  excluidoEm: Date | null;
  instituicao: string | null;
  curso: string | null;
  periodo: string | null;
  semVinculoAcademico: boolean;
  dataNascimento: Date | null;
  nacionalidade: string | null;
  cidade: string | null;
  estado: string | null;
  escolaridade: string | null;
  departamento: string | null;
  siape: string | null;
  aprovadoPorId: string | null;
  aprovadoEm: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type UsuarioSessaoBanco = {
  id: string;
  nome: string;
  nickname: string | null;
  email: string;
  senha: string;
  perfil: PerfilBanco;
  status: Status;
  excluidoEm: Date | null;
  instituicao: string | null;
  curso: string | null;
  semestre: string | null;
  dataNascimento: Date | null;
  nacionalidade: string | null;
  cidade: string | null;
  estado: string | null;
  nivelEducacional: string | null;
  departamento: string | null;
  siape: string | null;
  aprovadoPorId: string | null;
  aprovadoEm: Date | null;
  criadoEm: Date;
  atualizadoEm: Date;
};

function converterPerfilParaPapel(perfil: PerfilBanco): Papel {
  if (perfil === "ADMIN") {
    return PAPEIS.ADMINISTRADOR;
  }

  return perfil;
}

function converterUsuarioBanco(usuario: UsuarioSessaoBanco): UsuarioSessao {
  return {
    id: usuario.id,
    nome: usuario.nome,
    nickname: usuario.nickname,
    email: usuario.email,
    senhaHash: usuario.senha,
    papel: converterPerfilParaPapel(usuario.perfil),
    status: usuario.status,
    excluidoEm: usuario.excluidoEm,
    instituicao: usuario.instituicao,
    curso: usuario.curso,
    periodo: usuario.semestre,
    semVinculoAcademico:
      usuario.instituicao === VALOR_NAO_SE_APLICA &&
      usuario.curso === VALOR_NAO_SE_APLICA &&
      usuario.semestre === VALOR_NAO_SE_APLICA,
    dataNascimento: usuario.dataNascimento,
    nacionalidade: usuario.nacionalidade,
    cidade: usuario.cidade,
    estado: usuario.estado,
    escolaridade: usuario.nivelEducacional,
    departamento: usuario.departamento,
    siape: usuario.siape,
    aprovadoPorId: usuario.aprovadoPorId,
    aprovadoEm: usuario.aprovadoEm,
    createdAt: usuario.criadoEm,
    updatedAt: usuario.atualizadoEm,
  };
}

export class SessaoRepository {
  async buscarUsuarioPorEmail(email: string): Promise<UsuarioSessao | null> {
    const registros = await prisma.$queryRaw<UsuarioSessaoBanco[]>`
      SELECT
        id,
        nome,
        nickname,
        email,
        senha,
        perfil,
        status,
        "excluidoEm",
        instituicao,
        curso,
        semestre,
        "dataNascimento",
        nacionalidade,
        cidade,
        estado,
        "nivelEducacional",
        departamento,
        siape,
        "aprovadoPorId",
        "aprovadoEm",
        "criadoEm",
        "atualizadoEm"
      FROM usuarios
      WHERE email = ${email}
      LIMIT 1
    `;

    const usuario = registros[0];

    return usuario ? converterUsuarioBanco(usuario) : null;
  }

  async buscarUsuarioPorId(id: string): Promise<UsuarioSessao | null> {
    const registros = await prisma.$queryRaw<UsuarioSessaoBanco[]>`
      SELECT
        id,
        nome,
        nickname,
        email,
        senha,
        perfil,
        status,
        "excluidoEm",
        instituicao,
        curso,
        semestre,
        "dataNascimento",
        nacionalidade,
        cidade,
        estado,
        "nivelEducacional",
        departamento,
        siape,
        "aprovadoPorId",
        "aprovadoEm",
        "criadoEm",
        "atualizadoEm"
      FROM usuarios
      WHERE id = ${id}
      LIMIT 1
    `;

    const usuario = registros[0];

    return usuario ? converterUsuarioBanco(usuario) : null;
  }

  async salvarRefreshToken(usuarioId: string, token: string, expiraEm: Date): Promise<void> {
    await prisma.$executeRaw`
      INSERT INTO refresh_tokens (
        id,
        token,
        "usuarioId",
        "expiraEm",
        "criadoEm"
      )
      VALUES (
        ${randomUUID()},
        ${token},
        ${usuarioId},
        ${expiraEm},
        NOW()
      )
    `;
  }
}
