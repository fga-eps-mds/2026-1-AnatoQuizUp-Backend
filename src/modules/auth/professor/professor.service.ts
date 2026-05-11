import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";

import type { RegistrarProfessorDto } from "@/modules/auth/professor/dto/registrar.professor.types";
import {
  converterParaRespostaProfessor,
  type RespostaProfessorDto,
} from "@/modules/auth/professor/dto/resposta.professor.types";
import type { ProfessorAuthRepository } from "@/modules/auth/professor/professor.repository";
import { MENSAGENS } from "@/shared/constants/mensagens";
import { PAPEIS, STATUS_USUARIO } from "@/shared/constants/papeis";
import { CodigoDeErro } from "@/shared/errors/codigos-de-erro";
import { ErroAplicacao } from "@/shared/errors/erro-aplicacao";
import { normalizarEspacos } from "@/shared/utils/formatacao.util";

const BCRYPT_SALT_ROUNDS = 10;

function normalizarEmail(value: string) {
  return value.trim().toLowerCase();
}

function normalizarTexto(value: string) {
  return normalizarEspacos(value);
}

function ehErroDeCampoUnicoDuplicado(error: unknown, campo: "email" | "siape") {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return false;
  }

  if (error.code === "P2002") {
    const target = error.meta?.target;

    if (Array.isArray(target)) {
      return target.includes(campo);
    }

    return String(target ?? "").includes(campo);
  }

  if (error.code !== "P2010" || typeof error.meta !== "object" || error.meta === null) {
    return false;
  }

  const meta = error.meta as Record<string, unknown>;
  const mensagem = String(meta.message ?? "");

  return meta.code === "23505" && mensagem.includes(`usuarios_${campo}_key`);
}

export class ProfessorAuthService {
  constructor(private readonly professorAuthRepository: ProfessorAuthRepository) {}

  async registrar(input: RegistrarProfessorDto): Promise<RespostaProfessorDto> {
    const email = normalizarEmail(input.email);
    const siape = input.siape.trim();

    const usuarioComEmail = await this.professorAuthRepository.buscarPorEmail(email);

    if (usuarioComEmail) {
      throw this.criarErroEmailDuplicado(email);
    }

    const usuarioComSiape = await this.professorAuthRepository.buscarPorSiape(siape);

    if (usuarioComSiape) {
      throw this.criarErroSiapeDuplicado(siape);
    }

    const senhaHash = await bcrypt.hash(input.senha, BCRYPT_SALT_ROUNDS);

    try {
      const professorCriado = await this.professorAuthRepository.criar({
        nome: normalizarTexto(input.nome),
        email,
        senhaHash,
        instituicao: "UnB",
        departamento: normalizarTexto(input.departamento),
        curso: normalizarTexto(input.curso),
        siape,
        papel: PAPEIS.PROFESSOR,
        status: STATUS_USUARIO.PENDENTE,
      });

      return converterParaRespostaProfessor(professorCriado);
    } catch (error) {
      if (ehErroDeCampoUnicoDuplicado(error, "email")) {
        throw this.criarErroEmailDuplicado(email);
      }

      if (ehErroDeCampoUnicoDuplicado(error, "siape")) {
        throw this.criarErroSiapeDuplicado(siape);
      }

      throw error;
    }
  }

  private criarErroEmailDuplicado(email: string) {
    return new ErroAplicacao({
      codigoStatus: 409,
      codigo: CodigoDeErro.CONFLITO,
      mensagem: MENSAGENS.emailJaCadastrado,
      detalhes: { email },
    });
  }

  private criarErroSiapeDuplicado(siape: string) {
    return new ErroAplicacao({
      codigoStatus: 409,
      codigo: CodigoDeErro.CONFLITO,
      mensagem: MENSAGENS.siapeJaCadastrado,
      detalhes: { siape },
    });
  }
}
