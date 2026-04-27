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

jest.mock("node:fs", () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
}));

jest.mock("@/config/logger", () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

import { existsSync, readFileSync } from "node:fs";

import { logger } from "@/config/logger";
import { enviarEmailRedefinicaoSenha } from "@/shared/services/emailService";

const existsSyncMock = existsSync as jest.MockedFunction<typeof existsSync>;
const readFileSyncMock = readFileSync as jest.MockedFunction<typeof readFileSync>;
const loggerMock = logger as jest.Mocked<typeof logger>;
const { sendTransacEmail: mockSendTransacEmail } = jest.requireMock("@getbrevo/brevo") as {
  sendTransacEmail: jest.Mock;
};

describe("emailService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("envia email de redefinicao de senha com template textual quando a logo nao existe", async () => {
    existsSyncMock.mockReturnValue(false);
    mockSendTransacEmail.mockResolvedValue({ messageId: "message-id" });

    await enviarEmailRedefinicaoSenha(
      "aluno@example.com",
      "https://app.example.com/reset-password?token=abc",
    );

    expect(mockSendTransacEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: "Redefinicao de senha - AnatoQuizUp",
        sender: {
          name: "AnatoQuizUp",
          email: "noreply@example.com",
        },
        to: [{ email: "aluno@example.com" }],
        htmlContent: expect.stringContaining("https://app.example.com/reset-password?token=abc"),
        textContent: expect.stringContaining("Este link expira em 1 hora."),
      }),
    );
    expect(loggerMock.warn).toHaveBeenCalledWith(
      expect.objectContaining({ caminhoLogo: expect.any(String) }),
      "Logo de email nao encontrada. Template usara cabecalho textual.",
    );
    expect(loggerMock.info).toHaveBeenCalledWith(
      {
        destinatario: "aluno@example.com",
        messageId: "message-id",
      },
      "Email de redefinicao de senha enviado com sucesso.",
    );
  });

  it("inclui logo embutida quando o arquivo existe", async () => {
    existsSyncMock.mockReturnValue(true);
    readFileSyncMock.mockReturnValue(Buffer.from("logo"));
    mockSendTransacEmail.mockResolvedValue({ messageId: "message-id" });

    await enviarEmailRedefinicaoSenha(
      "aluno@example.com",
      "https://app.example.com/reset-password?token=abc",
    );

    expect(mockSendTransacEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        htmlContent: expect.stringContaining("data:image/png;base64,bG9nbw=="),
      }),
    );
  });

  it("loga falha e propaga erro padronizado quando o provedor rejeita o envio", async () => {
    const erro = new Error("brevo indisponivel");
    existsSyncMock.mockReturnValue(false);
    mockSendTransacEmail.mockRejectedValue(erro);

    await expect(
      enviarEmailRedefinicaoSenha(
        "aluno@example.com",
        "https://app.example.com/reset-password?token=abc",
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
