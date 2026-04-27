import type { Request, Response } from "express";

import type { NacionalidadesAlunoDto } from "@/modules/auth/aluno/nacionalidades/dto/resposta.nacionalidade.types";
import { AlunoNacionalidadesController } from "@/modules/auth/aluno/nacionalidades/nacionalidades.controller";
import type { AlunoNacionalidadesService } from "@/modules/auth/aluno/nacionalidades/nacionalidades.service";
import { MENSAGENS } from "@/shared/constants/mensagens";
import type { RespostaApiSucesso } from "@/shared/types/api.types";

describe("AlunoNacionalidadesController", () => {
  it("retorna 200 com nacionalidades no formato padrao da API", async () => {
    const nacionalidades: NacionalidadesAlunoDto = ["Brasileiro(a)", "Estrangeiro(a)"];
    const listarNacionalidades = jest
      .fn<AlunoNacionalidadesService["listarNacionalidades"]>()
      .mockReturnValue(nacionalidades);
    const controller = new AlunoNacionalidadesController({
      listarNacionalidades,
    } as unknown as AlunoNacionalidadesService);
    const request = {} as Request;
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const response = { status } as unknown as Response<RespostaApiSucesso<typeof nacionalidades>>;
    const next = jest.fn();

    await controller.listarNacionalidades(request, response, next);

    expect(listarNacionalidades).toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      mensagem: MENSAGENS.nacionalidadesListadas,
      dados: nacionalidades,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("encaminha erro da listagem para o middleware de erro", async () => {
    const erro = new Error("falha ao listar nacionalidades");
    const listarNacionalidades = jest.fn<AlunoNacionalidadesService["listarNacionalidades"]>(() => {
      throw erro;
    });
    const controller = new AlunoNacionalidadesController({
      listarNacionalidades,
    } as unknown as AlunoNacionalidadesService);
    const request = {} as Request;
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const response = { status } as unknown as Response<RespostaApiSucesso<NacionalidadesAlunoDto>>;
    const next = jest.fn();

    await controller.listarNacionalidades(request, response, next);

    expect(next).toHaveBeenCalledWith(erro);
    expect(status).toHaveBeenCalledWith(200);
    expect(json).not.toHaveBeenCalled();
  });
});
