jest.mock("@getbrevo/brevo", () => ({
  BrevoClient: jest.fn().mockImplementation(() => {
    const { sendTransacEmail } = jest.requireMock("@getbrevo/brevo") as {
      sendTransacEmail: jest.Mock;
    };

    return {
      transactionalEmails: {
        sendTransacEmail,
      },
    };
  }),
  sendTransacEmail: jest.fn(),
}));

jest.mock("@/config/logger", () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

import { logger } from "@/config/logger";
import { enviarEmailRedefinicaoSenha } from "@/shared/services/emailService";

const loggerMock = logger as jest.Mocked<typeof logger>;
const { sendTransacEmail: mockSendTransacEmail } = jest.requireMock("@getbrevo/brevo") as {
  sendTransacEmail: jest.Mock;
};

describe("emailService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("envia email de redefinicao de senha com template compacto e sem imagem embutida", async () => {
    mockSendTransacEmail.mockResolvedValue({ messageId: "message-id" });

    await enviarEmailRedefinicaoSenha(
      "aluno@example.com",
      "https://app.example.com/redefinir-senha?token=abc",
    );

    expect(mockSendTransacEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: "Redefinicao de senha - AnatoQuizUp",
        sender: {
          name: "AnatoQuizUp",
          email: "noreply@example.com",
        },
        to: [{ email: "aluno@example.com" }],
        htmlContent: expect.stringContaining("https://app.example.com/redefinir-senha?token=abc"),
        textContent: expect.stringContaining("Este link expira em 1 hora."),
      }),
    );
    const payload = mockSendTransacEmail.mock.calls[0]?.[0] as { htmlContent: string };

    expect(payload.htmlContent).toContain("AnatoQuizUp");
    expect(payload.htmlContent).not.toContain("data:image");
    expect(loggerMock.info).toHaveBeenCalledWith(
      {
        destinatario: "aluno@example.com",
        messageId: "message-id",
      },
      "Email de redefinicao de senha enviado com sucesso.",
    );
  });

  it("loga falha e propaga erro padronizado quando o provedor rejeita o envio", async () => {
    const erro = new Error("brevo indisponivel");
    mockSendTransacEmail.mockRejectedValue(erro);

    await expect(
      enviarEmailRedefinicaoSenha(
        "aluno@example.com",
        "https://app.example.com/redefinir-senha?token=abc",
      ),
    ).rejects.toThrow("Falha ao enviar email de redefinicao de senha.");
    expect(loggerMock.error).toHaveBeenCalledWith(
      {
        error: erro,
        destinatario: "aluno@example.com",
      },
      "Falha ao enviar email de redefinicao de senha.",
    );
  });
});
