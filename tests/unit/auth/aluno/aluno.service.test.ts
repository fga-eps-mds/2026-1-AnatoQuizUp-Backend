import bcrypt from "bcrypt";
import { describe, expect, it, vi } from "vitest";

import type { AlunoAuthRepository } from "@/modules/auth/aluno/aluno.repository";
import { AlunoAuthService } from "@/modules/auth/aluno/aluno.service";
import { VALOR_NAO_SE_APLICA } from "@/modules/auth/aluno/aluno.constants";
import { MENSAGENS } from "@/shared/constants/mensagens";
import { CodigoDeErro } from "@/shared/errors/codigos-de-erro";

function criarAlunoAuthRepositoryMock() {
  const buscarPorEmail = vi.fn<AlunoAuthRepository["buscarPorEmail"]>().mockResolvedValue(null);
  const criar = vi.fn<AlunoAuthRepository["criar"]>(async (data) => ({
    id: "usuario-id",
    nome: data.nome,
    email: data.email,
    instituicao: data.instituicao,
    curso: data.curso,
    periodo: data.periodo,
    semVinculoAcademico:
      data.instituicao === VALOR_NAO_SE_APLICA &&
      data.curso === VALOR_NAO_SE_APLICA &&
      data.periodo === VALOR_NAO_SE_APLICA,
    dataNascimento: data.dataNascimento,
    nacionalidade: data.nacionalidade,
    cidade: data.cidade,
    estado: data.estado,
    escolaridade: data.escolaridade,
    papel: data.papel,
    status: data.status,
    createdAt: new Date("2026-04-25T12:00:00.000Z"),
    updatedAt: new Date("2026-04-25T12:00:00.000Z"),
  }));

  return {
    alunoAuthRepository: { buscarPorEmail, criar } as unknown as AlunoAuthRepository,
    buscarPorEmail,
    criar,
  };
}

describe("AlunoAuthService", () => {
  it("cadastra aluno com todos os campos, senha hasheada e perfil ALUNO/ATIVO", async () => {
    const { alunoAuthRepository, buscarPorEmail, criar } = criarAlunoAuthRepositoryMock();
    const service = new AlunoAuthService(alunoAuthRepository);

    const resposta = await service.registrar({
      nome: "  Joao   da Silva Junior  ",
      email: "JOAO.JUNIOR@ALUNO.UNB.BR",
      senha: "senha1234",
      confirmacaoSenha: "senha1234",
      instituicao: " Universidade   de Brasilia ",
      curso: " Medicina ",
      periodo: " 3 ",
      dataNascimento: "2003-12-30",
      nacionalidade: " Brasileiro ",
      cidade: " Brasilia ",
      estado: "DF",
      escolaridade: "GRADUACAO",
    });

    const dadosCriacao = criar.mock.calls[0]?.[0];

    expect(buscarPorEmail).toHaveBeenCalledWith("joao.junior@aluno.unb.br");
    expect(dadosCriacao).toBeDefined();

    if (!dadosCriacao) {
      throw new Error("Dados de criacao nao capturados.");
    }

    expect(dadosCriacao.nome).toBe("Joao da Silva Junior");
    expect(dadosCriacao.email).toBe("joao.junior@aluno.unb.br");
    expect(dadosCriacao.instituicao).toBe("Universidade de Brasilia");
    expect(dadosCriacao.curso).toBe("Medicina");
    expect(dadosCriacao.periodo).toBe("3");
    expect(dadosCriacao.dataNascimento.toISOString().slice(0, 10)).toBe("2003-12-30");
    expect(dadosCriacao.nacionalidade).toBe("Brasileiro");
    expect(dadosCriacao.cidade).toBe("Brasilia");
    expect(dadosCriacao.estado).toBe("DF");
    expect(dadosCriacao.escolaridade).toBe("GRADUACAO");
    expect(dadosCriacao.papel).toBe("ALUNO");
    expect(dadosCriacao.status).toBe("ATIVO");
    expect(dadosCriacao.senhaHash).not.toBe("senha1234");
    expect(dadosCriacao.senhaHash).toContain("$10$");
    await expect(bcrypt.compare("senha1234", dadosCriacao.senhaHash)).resolves.toBe(true);
    expect(resposta).not.toHaveProperty("senha");
    expect(resposta).not.toHaveProperty("senhaHash");
    expect(resposta.dataNascimento).toBe("2003-12-30");
  });

  it("aceita Nao se aplica como valor literal para dados academicos", async () => {
    const { alunoAuthRepository, criar } = criarAlunoAuthRepositoryMock();
    const service = new AlunoAuthService(alunoAuthRepository);

    const resposta = await service.registrar({
      nome: "Maria",
      email: "maria@aluno.unb.br",
      senha: "senha1234",
      confirmacaoSenha: "senha1234",
      instituicao: VALOR_NAO_SE_APLICA,
      curso: VALOR_NAO_SE_APLICA,
      periodo: VALOR_NAO_SE_APLICA,
      dataNascimento: "2003-12-30",
      nacionalidade: "Brasileira",
      cidade: "Brasilia",
      estado: "DF",
      escolaridade: "ENSINO_MEDIO",
    });

    const dadosCriacao = criar.mock.calls[0]?.[0];

    expect(dadosCriacao?.instituicao).toBe(VALOR_NAO_SE_APLICA);
    expect(dadosCriacao?.curso).toBe(VALOR_NAO_SE_APLICA);
    expect(dadosCriacao?.periodo).toBe(VALOR_NAO_SE_APLICA);
    expect(resposta.semVinculoAcademico).toBe(true);
  });

  it("retorna conflito quando email ja esta cadastrado", async () => {
    const { alunoAuthRepository, buscarPorEmail, criar } = criarAlunoAuthRepositoryMock();
    buscarPorEmail.mockResolvedValue({
      id: "usuario-existente",
      email: "joao.junior@aluno.unb.br",
    });
    const service = new AlunoAuthService(alunoAuthRepository);

    await expect(
      service.registrar({
        nome: "Joao",
        email: "joao.junior@aluno.unb.br",
        senha: "senha1234",
        confirmacaoSenha: "senha1234",
        instituicao: "Universidade de Brasilia",
        curso: "Medicina",
        periodo: "3",
        dataNascimento: "2003-12-30",
        nacionalidade: "Brasileiro",
        cidade: "Brasilia",
        estado: "DF",
        escolaridade: "GRADUACAO",
      }),
    ).rejects.toMatchObject({
      codigoStatus: 409,
      codigo: CodigoDeErro.CONFLITO,
      message: MENSAGENS.emailJaCadastrado,
    });
    expect(criar).not.toHaveBeenCalled();
  });
});
