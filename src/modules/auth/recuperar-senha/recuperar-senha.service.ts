import { randomUUID } from "node:crypto";

import bcrypt from "bcryptjs";

import { env } from "@/config/env";
import type { RecuperarSenhaRepository } from "@/modules/auth/recuperar-senha/recuperar-senha.repository";
import type {
  RedefinirSenhaDto,
  SolicitarRecuperacaoSenhaDto,
} from "@/modules/auth/recuperar-senha/recuperar-senha.types";
import { MENSAGENS } from "@/shared/constants/mensagens";
import { CodigoDeErro } from "@/shared/errors/codigos-de-erro";
import { ErroAplicacao } from "@/shared/errors/erro-aplicacao";
import { enviarEmailRedefinicaoSenha } from "@/shared/services/emailService";

const BCRYPT_SALT_ROUNDS = 10;
const VALIDADE_TOKEN_REDEFINICAO_SENHA_MS = 60 * 60 * 1000;

type EnviarEmailRedefinicaoSenha = typeof enviarEmailRedefinicaoSenha;

function normalizarEmail(email: string) {
  return email.trim().toLowerCase();
}

function criarLinkRedefinicaoSenha(token: string) {
  return `${env.FRONTEND_PROD_URL}/redefinir-senha?token=${encodeURIComponent(token)}`;
}

function tokenEstaExpirado(expiraEm: Date, agora: Date) {
  return expiraEm.getTime() <= agora.getTime();
}

export class RecuperarSenhaService {
  constructor(
    private readonly recuperarSenhaRepository: RecuperarSenhaRepository,
    private readonly enviarEmail: EnviarEmailRedefinicaoSenha = enviarEmailRedefinicaoSenha,
  ) {}

  async forgotPassword(input: SolicitarRecuperacaoSenhaDto): Promise<void> {
    const email = normalizarEmail(input.email);
    const usuario = await this.recuperarSenhaRepository.buscarUsuarioPorEmail(email);

    if (!usuario) {
      return;
    }

    const token = randomUUID();
    const expiraEm = new Date(Date.now() + VALIDADE_TOKEN_REDEFINICAO_SENHA_MS);

    await this.recuperarSenhaRepository.criarTokenRedefinicaoSenha({
      token,
      usuarioId: usuario.id,
      expiraEm,
    });

    await this.enviarEmail(usuario.email, criarLinkRedefinicaoSenha(token));
  }

  async resetPassword(input: RedefinirSenhaDto): Promise<void> {
    const agora = new Date();
    const tokenRedefinicao = await this.recuperarSenhaRepository.buscarTokenRedefinicaoSenha(
      input.token,
    );

    if (
      !tokenRedefinicao ||
      tokenRedefinicao.usadoEm ||
      tokenEstaExpirado(tokenRedefinicao.expiraEm, agora)
    ) {
      throw this.criarErroLinkInvalido();
    }

    const senhaHash = await bcrypt.hash(input.senha, BCRYPT_SALT_ROUNDS);
    const senhaAtualizada = await this.recuperarSenhaRepository.atualizarSenhaComToken({
      token: input.token,
      usuarioId: tokenRedefinicao.usuarioId,
      senhaHash,
      agora,
    });

    if (!senhaAtualizada) {
      throw this.criarErroLinkInvalido();
    }
  }

  private criarErroLinkInvalido() {
    return new ErroAplicacao({
      codigoStatus: 400,
      codigo: CodigoDeErro.TOKEN_INVALIDO,
      mensagem: MENSAGENS.linkRedefinicaoSenhaInvalido,
    });
  }
}
