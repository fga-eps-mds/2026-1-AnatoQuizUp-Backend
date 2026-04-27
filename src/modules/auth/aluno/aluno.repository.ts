import { randomUUID } from "node:crypto";

import { prisma } from "@/config/db";
import { VALOR_NAO_SE_APLICA, type EscolaridadeAluno } from "@/modules/auth/aluno/aluno.constants";
import type { RegistroAluno } from "@/modules/auth/aluno/dto/resposta.aluno.types";
import type { Papel, StatusUsuario } from "@/shared/constants/papeis";

export type CriarAlunoData = {
  nome: string;
  nickname: string;
  email: string;
  senhaHash: string;
  instituicao: string;
  curso: string;
  periodo: string;
  dataNascimento: Date;
  nacionalidade: string;
  cidade: string;
  estado: string;
  escolaridade: EscolaridadeAluno;
  papel: Papel;
  status: StatusUsuario;
};

type NivelEducacional = EscolaridadeAluno | "MESTRADO" | "DOUTORADO";

type AlunoPorEmail = {
  id: string;
  email: string;
};

type AlunoPorNickname = {
  id: string;
  nickname: string;
};

type RegistroAlunoBanco = {
  id: string;
  nome: string;
  nickname: string | null;
  email: string;
  instituicao: string | null;
  curso: string | null;
  semestre: string | null;
  estado: string | null;
  cidade: string | null;
  nacionalidade: string | null;
  dataNascimento: Date | null;
  nivelEducacional: NivelEducacional | null;
  perfil: Papel;
  status: StatusUsuario;
  criadoEm: Date;
  atualizadoEm: Date;
};

function converterRegistroBanco(registro: RegistroAlunoBanco): RegistroAluno {
  return {
    id: registro.id,
    nome: registro.nome,
    nickname: registro.nickname,
    email: registro.email,
    instituicao: registro.instituicao,
    curso: registro.curso,
    periodo: registro.semestre,
    semVinculoAcademico:
      registro.instituicao === VALOR_NAO_SE_APLICA &&
      registro.curso === VALOR_NAO_SE_APLICA &&
      registro.semestre === VALOR_NAO_SE_APLICA,
    dataNascimento: registro.dataNascimento,
    nacionalidade: registro.nacionalidade,
    cidade: registro.cidade,
    estado: registro.estado,
    escolaridade: registro.nivelEducacional,
    papel: registro.perfil,
    status: registro.status,
    createdAt: registro.criadoEm,
    updatedAt: registro.atualizadoEm,
  };
}

export class AlunoAuthRepository {
  async buscarPorEmail(email: string): Promise<AlunoPorEmail | null> {
    const registros = await prisma.$queryRaw<AlunoPorEmail[]>`
      SELECT id, email
      FROM usuarios
      WHERE email = ${email}
      LIMIT 1
    `;

    return registros[0] ?? null;
  }

  async buscarPorNickname(nickname: string): Promise<AlunoPorNickname | null> {
    const registros = await prisma.$queryRaw<AlunoPorNickname[]>`
      SELECT id, nickname
      FROM usuarios
      WHERE nickname = ${nickname}
      LIMIT 1
    `;

    return registros[0] ?? null;
  }

  async criar(data: CriarAlunoData) {
    const id = randomUUID();

    const registros = await prisma.$queryRaw<RegistroAlunoBanco[]>`
      INSERT INTO usuarios (
        id,
        nome,
        nickname,
        email,
        senha,
        perfil,
        status,
        instituicao,
        curso,
        semestre,
        estado,
        cidade,
        nacionalidade,
        "dataNascimento",
        "nivelEducacional",
        "criadoEm",
        "atualizadoEm"
      )
      VALUES (
        ${id},
        ${data.nome},
        ${data.nickname},
        ${data.email},
        ${data.senhaHash},
        ${data.papel}::"PerfilUsuario",
        ${data.status}::"StatusUsuario",
        ${data.instituicao},
        ${data.curso},
        ${data.periodo},
        ${data.estado},
        ${data.cidade},
        ${data.nacionalidade},
        ${data.dataNascimento},
        ${data.escolaridade}::"NivelEducacional",
        NOW(),
        NOW()
      )
      RETURNING
        id,
        nome,
        nickname,
        email,
        instituicao,
        curso,
        semestre,
        estado,
        cidade,
        nacionalidade,
        "dataNascimento",
        "nivelEducacional",
        perfil,
        status,
        "criadoEm",
        "atualizadoEm"
    `;

    return converterRegistroBanco(registros[0]);
  }
}
