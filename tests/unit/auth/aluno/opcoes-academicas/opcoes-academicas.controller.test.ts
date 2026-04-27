import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";

import type { OpcoesAcademicasAlunoDto } from "@/modules/auth/aluno/opcoes-academicas/dto/resposta.opcoes-academicas.types";
import { AlunoOpcoesAcademicasController } from "@/modules/auth/aluno/opcoes-academicas/opcoes-academicas.controller";
import type { AlunoOpcoesAcademicasService } from "@/modules/auth/aluno/opcoes-academicas/opcoes-academicas.service";
import { MENSAGENS } from "@/shared/constants/mensagens";
import type { RespostaApiSucesso } from "@/shared/types/api.types";

describe("AlunoOpcoesAcademicasController", () => {
  it("retorna 200 com opcoes academicas no formato padrao da API", async () => {
    const opcoes: OpcoesAcademicasAlunoDto = {
      escolaridades: ["Graduação"],
      instituicoes: ["Universidade de Brasilia"],
      cursos: ["Medicina"],
      periodos: ["1o Periodo"],
      naoSeAplica: "Não se aplica",
    };
    const listarOpcoesAcademicas = vi
      .fn<AlunoOpcoesAcademicasService["listarOpcoesAcademicas"]>()
      .mockReturnValue(opcoes);
    const controller = new AlunoOpcoesAcademicasController({
      listarOpcoesAcademicas,
    } as unknown as AlunoOpcoesAcademicasService);
    const request = {} as Request;
    const json = vi.fn();
    const status = vi.fn(() => ({ json }));
    const response = { status } as unknown as Response<RespostaApiSucesso<typeof opcoes>>;
    const next = vi.fn();

    await controller.listarOpcoesAcademicas(request, response, next);

    expect(listarOpcoesAcademicas).toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      mensagem: MENSAGENS.opcoesAcademicasListadas,
      dados: opcoes,
    });
    expect(next).not.toHaveBeenCalled();
  });
});

