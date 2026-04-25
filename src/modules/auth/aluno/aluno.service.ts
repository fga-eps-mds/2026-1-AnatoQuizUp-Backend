import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";

import type { AlunoAuthRepository } from "@/modules/auth/aluno/aluno.repository";
import type { RegistrarAlunoDto } from "@/modules/auth/aluno/dto/registrar.aluno.types";
import {
  converterParaRespostaAluno,
  type RespostaAlunoDto,
} from "@/modules/auth/aluno/dto/resposta.aluno.types";
import { MENSAGENS } from "@/shared/constants/mensagens";
import { PAPEIS, STATUS_USUARIO } from "@/shared/constants/papeis";
import { CodigoDeErro } from "@/shared/errors/codigos-de-erro";
import { ErroAplicacao } from "@/shared/errors/erro-aplicacao";
import { normalizarEspacos } from "@/shared/utils/formatacao.util";

const BCRYPT_SALT_ROUNDS = 10;

function normalizarTexto(value: string) {
  return normalizarEspacos(value);
}

function converterDataNascimento(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function ehErroDeEmailDuplicado(error: unknown) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return false;
  }

  if (error.code === "P2002") {
    return true;
  }

  if (error.code !== "P2010" || typeof error.meta !== "object" || error.meta === null) {
    return false;
  }

  const meta = error.meta as Record<string, unknown>;
  return meta.code === "23505" || String(meta.message ?? "").includes("usuarios_email_key");
}

export class AlunoAuthService {
  constructor(private readonly alunoAuthRepository: AlunoAuthRepository) {}

  async registrar(input: RegistrarAlunoDto): Promise<RespostaAlunoDto> {
    const email = input.email.trim().toLowerCase();
    const alunoExistente = await this.alunoAuthRepository.buscarPorEmail(email);

    if (alunoExistente) {
      throw this.criarErroEmailDuplicado(email);
    }

    const senhaHash = await bcrypt.hash(input.senha, BCRYPT_SALT_ROUNDS);

    try {
      const alunoCriado = await this.alunoAuthRepository.criar({
        nome: normalizarEspacos(input.nome),
        email,
        senhaHash,
        instituicao: normalizarTexto(input.instituicao),
        curso: normalizarTexto(input.curso),
        periodo: normalizarTexto(input.periodo),
        dataNascimento: converterDataNascimento(input.dataNascimento),
        nacionalidade: normalizarTexto(input.nacionalidade),
        cidade: normalizarTexto(input.cidade),
        estado: normalizarTexto(input.estado),
        escolaridade: input.escolaridade,
        papel: PAPEIS.ALUNO,
        status: STATUS_USUARIO.ATIVO,
      });

      return converterParaRespostaAluno(alunoCriado);
    } catch (error) {
      if (ehErroDeEmailDuplicado(error)) {
        throw this.criarErroEmailDuplicado(email);
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
}
