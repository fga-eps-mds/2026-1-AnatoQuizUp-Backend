import { BrevoClient } from "@getbrevo/brevo";

import { env } from "@/config/env";
import { logger } from "@/config/logger";

const clienteBrevo = new BrevoClient({
  apiKey: env.BREVO_API_KEY,
  timeoutInSeconds: 30,
  maxRetries: 2,
});

function criarConteudoTextoRedefinicaoSenha(resetLink: string) {
  return [
    "AnatoQuizUp",
    "",
    "Recebemos uma solicitacao para redefinir a sua senha.",
    "Use o link abaixo para cadastrar uma nova senha:",
    resetLink,
    "",
    "Este link expira em 1 hora.",
    "Se voce nao solicitou a redefinicao, ignore este email.",
  ].join("\n");
}

function criarConteudoHtmlRedefinicaoSenha(resetLink: string) {
  return `
    <html lang="pt-BR">
      <body style="margin: 0; padding: 24px; background-color: #f4f7fb; font-family: Arial, sans-serif; color: #0f172a;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #dbe4f0;">
          <div style="margin-bottom: 24px;">
            <!-- TODO: substituir cabecalho textual pela logo oficial do AnatoQuizUp quando o asset estiver disponivel para email. -->
            <p style="margin: 0; font-size: 24px; font-weight: 700; color: #0a1128;">AnatoQuizUp</p>
          </div>

          <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6;">
            Recebemos uma solicitacao para redefinir a sua senha.
          </p>

          <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6;">
            Clique no botao abaixo para cadastrar uma nova senha:
          </p>

          <p style="margin: 0 0 24px;">
            <a
              href="${resetLink}"
              style="display: inline-block; background-color: #0a1128; color: #ffffff; text-decoration: none; padding: 14px 20px; border-radius: 10px; font-weight: 700;"
            >
              Redefinir senha
            </a>
          </p>

          <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6;">
            Se preferir, copie e cole este link no navegador:
          </p>

          <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; word-break: break-word;">
            <a href="${resetLink}" style="color: #2563eb;">${resetLink}</a>
          </p>

          <p style="margin: 0 0 8px; font-size: 14px; line-height: 1.6;">
            Este link expira em <strong>1 hora</strong>.
          </p>

          <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #475569;">
            Se voce nao solicitou a redefinicao, ignore este email.
          </p>
        </div>
      </body>
    </html>
  `;
}

export async function sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
  try {
    const resposta = await clienteBrevo.transactionalEmails.sendTransacEmail({
      subject: "Redefinicao de senha - AnatoQuizUp",
      sender: {
        name: "AnatoQuizUp",
        email: env.EMAIL_FROM,
      },
      to: [{ email: to }],
      htmlContent: criarConteudoHtmlRedefinicaoSenha(resetLink),
      textContent: criarConteudoTextoRedefinicaoSenha(resetLink),
    });

    logger.info(
      {
        destinatario: to,
        messageId: resposta.messageId,
      },
      "Email de redefinicao de senha enviado com sucesso.",
    );
  } catch (error) {
    logger.error(
      {
        error,
        destinatario: to,
      },
      "Falha ao enviar email de redefinicao de senha.",
    );

    throw new Error("Falha ao enviar email de redefinicao de senha.");
  }
}
