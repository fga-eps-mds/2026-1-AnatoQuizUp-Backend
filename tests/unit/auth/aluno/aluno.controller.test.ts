import type { Request, Response } from "express";

import { AlunoAuthController } from "@/modules/auth/aluno/aluno.controller";
import type { AlunoAuthService } from "@/modules/auth/aluno/aluno.service";
import type {
  DisponibilidadeEmailAlunoDto,
  DisponibilidadeNicknameAlunoDto,
  RegistrarAlunoDto,
} from "@/modules/auth/aluno/dto/registrar.aluno.types";
import type { RespostaAlunoDto } from "@/modules/auth/aluno/dto/resposta.aluno.types";
import { MENSAGENS } from "@/shared/constants/mensagens";
import type { RespostaApiSucesso } from "@/shared/types/api.types";

describe("AlunoAuthController", () => {
  it("retorna 201 com aluno cadastrado sem senha", async () => {
    const body: RegistrarAlunoDto = {
      nome: "Joao da Silva Junior",
      nickname: "joao_junior",
      email: "joao.junior@aluno.unb.br",
      senha: "senha1234",
      confirmacaoSenha: "senha1234",
      instituicao: "Universidade de Brasilia",
      curso: "Medicina",
      periodo: "3",
      dataNascimento: "2003-12-30",
      nacionalidade: "Brasileiro",
      estado: "DF",
      cidade: "Brasilia",
      escolaridade: "GRADUACAO",
    };
    const aluno: RespostaAlunoDto = {
      id: "usuario-id",
      nome: "Joao da Silva Junior",
      nickname: "joao_junior",
      email: "joao.junior@aluno.unb.br",
      instituicao: "Universidade de Brasilia",
      curso: "Medicina",
      periodo: "3",
      semVinculoAcademico: false,
      dataNascimento: "2003-12-30",
      nacionalidade: "Brasileiro",
      cidade: "Brasilia",
      estado: "DF",
      escolaridade: "GRADUACAO",
      papel: "ALUNO",
      status: "ATIVO",
      createdAt: "2026-04-25T12:00:00.000Z",
      updatedAt: "2026-04-25T12:00:00.000Z",
    };
    const registrar = jest.fn<AlunoAuthService["registrar"]>().mockResolvedValue(aluno);
    const controller = new AlunoAuthController({
      registrar,
    } as unknown as AlunoAuthService);
    const request = { body } as Request<unknown, unknown, RegistrarAlunoDto>;
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const response = { status } as unknown as Response<RespostaApiSucesso<RespostaAlunoDto>>;
    const next = jest.fn();

    await controller.registrar(request, response, next);

    expect(registrar).toHaveBeenCalledWith(body);
    expect(status).toHaveBeenCalledWith(201);
    expect(json).toHaveBeenCalledWith({
      mensagem: MENSAGENS.usuarioCadastrado,
      dados: aluno,
    });
    expect(aluno).not.toHaveProperty("senha");
    expect(aluno).not.toHaveProperty("senhaHash");
    expect(next).not.toHaveBeenCalled();
  });

  it("retorna 200 com disponibilidade do nickname", async () => {
    const disponibilidade = {
      nickname: "joao_junior",
      disponivel: true,
    };
    const verificarNicknameDisponivel = jest
      .fn<AlunoAuthService["verificarNicknameDisponivel"]>()
      .mockResolvedValue(disponibilidade);
    const controller = new AlunoAuthController({
      verificarNicknameDisponivel,
    } as unknown as AlunoAuthService);
    const request = {
      query: { nickname: "joao_junior" },
    } as Request<unknown, unknown, unknown, DisponibilidadeNicknameAlunoDto>;
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const response = { status } as unknown as Response<RespostaApiSucesso<typeof disponibilidade>>;
    const next = jest.fn();

    await controller.verificarNicknameDisponivel(request, response, next);

    expect(verificarNicknameDisponivel).toHaveBeenCalledWith({ nickname: "joao_junior" });
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      mensagem: MENSAGENS.nicknameDisponivel,
      dados: disponibilidade,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("retorna 200 com disponibilidade do email", async () => {
    const disponibilidade = {
      email: "joao.junior@aluno.unb.br",
      disponivel: true,
    };
    const verificarEmailDisponivel = jest
      .fn<AlunoAuthService["verificarEmailDisponivel"]>()
      .mockResolvedValue(disponibilidade);
    const controller = new AlunoAuthController({
      verificarEmailDisponivel,
    } as unknown as AlunoAuthService);
    const request = {
      query: { email: "joao.junior@aluno.unb.br" },
    } as Request<unknown, unknown, unknown, DisponibilidadeEmailAlunoDto>;
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const response = { status } as unknown as Response<RespostaApiSucesso<typeof disponibilidade>>;
    const next = jest.fn();

    await controller.verificarEmailDisponivel(request, response, next);

    expect(verificarEmailDisponivel).toHaveBeenCalledWith({ email: "joao.junior@aluno.unb.br" });
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      mensagem: MENSAGENS.emailDisponivel,
      dados: disponibilidade,
    });
    expect(next).not.toHaveBeenCalled();
  });
});
