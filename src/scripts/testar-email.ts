import { env } from "@/config/env";
import { enviarEmailRedefinicaoSenha } from "@/shared/services/emailService";

async function main() {
  const destinatario = process.argv[2];
  const token = process.argv[3] ?? "teste-manual";

  if (!destinatario) {
    console.error(
      "Uso: npx tsx -r tsconfig-paths/register src/scripts/testar-email.ts <email> [token]",
    );
    process.exit(1);
  }

  const linkRedefinicao = `${env.FRONTEND_PROD_URL}/redefinir-senha?token=${encodeURIComponent(token)}`;

  await enviarEmailRedefinicaoSenha(destinatario, linkRedefinicao);

  console.log(`Email de teste enviado para ${destinatario}.`);
}

void main().catch((error) => {
  console.error("Falha ao executar o teste de envio de email.", error);
  process.exit(1);
});
