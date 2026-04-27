import { randomUUID } from "node:crypto";

import { prisma } from "@/config/db";

type UsuarioRecuperacaoSenha = {
  id: string;
  email: string;
};

export type TokenRedefinicaoSenha = {
  token: string;
  usuarioId: string;
  expiraEm: Date;
  usadoEm: Date | null;
};

export type CriarTokenRedefinicaoSenhaData = {
  token: string;
  usuarioId: string;
  expiraEm: Date;
};

export type AtualizarSenhaComTokenData = {
  token: string;
  usuarioId: string;
  senhaHash: string;
  agora: Date;
};

export class RecuperarSenhaRepository {
  async buscarUsuarioPorEmail(email: string): Promise<UsuarioRecuperacaoSenha | null> {
    const registros = await prisma.$queryRaw<UsuarioRecuperacaoSenha[]>`
      SELECT id, email
      FROM usuarios
      WHERE email = ${email}
        AND "excluidoEm" IS NULL
      LIMIT 1
    `;

    return registros[0] ?? null;
  }

  async criarTokenRedefinicaoSenha(data: CriarTokenRedefinicaoSenhaData): Promise<void> {
    await prisma.$executeRaw`
      INSERT INTO tokens_redefinicao_senha (
        id,
        token,
        "usuarioId",
        "expiraEm",
        "criadoEm"
      )
      VALUES (
        ${randomUUID()},
        ${data.token},
        ${data.usuarioId},
        ${data.expiraEm},
        NOW()
      )
    `;
  }

  async buscarTokenRedefinicaoSenha(token: string): Promise<TokenRedefinicaoSenha | null> {
    const registros = await prisma.$queryRaw<TokenRedefinicaoSenha[]>`
      SELECT
        token,
        "usuarioId",
        "expiraEm",
        "usadoEm"
      FROM tokens_redefinicao_senha
      WHERE token = ${token}
      LIMIT 1
    `;

    return registros[0] ?? null;
  }

  async atualizarSenhaComToken(data: AtualizarSenhaComTokenData): Promise<boolean> {
    const tokensAtualizados = await prisma.$transaction(async (transacao) => {
      const quantidadeTokensAtualizados = await transacao.$executeRaw`
        UPDATE tokens_redefinicao_senha
        SET "usadoEm" = ${data.agora}
        WHERE token = ${data.token}
          AND "usuarioId" = ${data.usuarioId}
          AND "usadoEm" IS NULL
          AND "expiraEm" > ${data.agora}
      `;

      if (quantidadeTokensAtualizados !== 1) {
        return quantidadeTokensAtualizados;
      }

      await transacao.$executeRaw`
        UPDATE usuarios
        SET
          senha = ${data.senhaHash},
          "atualizadoEm" = ${data.agora}
        WHERE id = ${data.usuarioId}
      `;

      return quantidadeTokensAtualizados;
    });

    return tokensAtualizados === 1;
  }
}
