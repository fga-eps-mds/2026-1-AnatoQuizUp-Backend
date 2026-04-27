import type { Request, Response } from "express";

import type {
  RespostaCidadeDto,
  RespostaEstadoDto,
} from "@/modules/auth/aluno/localidades/dto/resposta.localidade.types";
import { AlunoLocalidadesController } from "@/modules/auth/aluno/localidades/localidades.controller";
import type { BuscarCidadesPorUfDto } from "@/modules/auth/aluno/localidades/localidades.schemas";
import type { AlunoLocalidadesService } from "@/modules/auth/aluno/localidades/localidades.service";
import { MENSAGENS } from "@/shared/constants/mensagens";
import type { RespostaApiSucesso } from "@/shared/types/api.types";

describe("AlunoLocalidadesController", () => {
  it("retorna estados no formato padrao da API", async () => {
    const estados: RespostaEstadoDto[] = [{ sigla: "DF", nome: "Distrito Federal" }];
    const listarEstados = jest
      .fn<AlunoLocalidadesService["listarEstados"]>()
      .mockReturnValue(estados);
    const controller = new AlunoLocalidadesController({
      listarEstados,
    } as unknown as AlunoLocalidadesService);
    const request = {} as Request;
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const response = { status } as unknown as Response<RespostaApiSucesso<RespostaEstadoDto[]>>;
    const next = jest.fn();

    await controller.listarEstados(request, response, next);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      mensagem: MENSAGENS.estadosListados,
      dados: estados,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("retorna cidades por UF no formato padrao da API", async () => {
    const cidades: RespostaCidadeDto[] = [{ nome: "Brasilia", uf: "DF" }];
    const listarCidadesPorUf = jest
      .fn<AlunoLocalidadesService["listarCidadesPorUf"]>()
      .mockReturnValue(cidades);
    const controller = new AlunoLocalidadesController({
      listarCidadesPorUf,
    } as unknown as AlunoLocalidadesService);
    const request = { params: { uf: "DF" } } as Request<BuscarCidadesPorUfDto>;
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const response = { status } as unknown as Response<RespostaApiSucesso<RespostaCidadeDto[]>>;
    const next = jest.fn();

    await controller.listarCidadesPorUf(request, response, next);

    expect(listarCidadesPorUf).toHaveBeenCalledWith("DF");
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      mensagem: MENSAGENS.cidadesListadas,
      dados: cidades,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("encaminha erro da listagem de estados para o middleware de erro", async () => {
    const erro = new Error("falha ao listar estados");
    const listarEstados = jest.fn<AlunoLocalidadesService["listarEstados"]>(() => {
      throw erro;
    });
    const controller = new AlunoLocalidadesController({
      listarEstados,
    } as unknown as AlunoLocalidadesService);
    const request = {} as Request;
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const response = { status } as unknown as Response<RespostaApiSucesso<RespostaEstadoDto[]>>;
    const next = jest.fn();

    await controller.listarEstados(request, response, next);

    expect(next).toHaveBeenCalledWith(erro);
    expect(status).toHaveBeenCalledWith(200);
    expect(json).not.toHaveBeenCalled();
  });

  it("encaminha erro da listagem de cidades para o middleware de erro", async () => {
    const erro = new Error("falha ao listar cidades");
    const listarCidadesPorUf = jest.fn<AlunoLocalidadesService["listarCidadesPorUf"]>(() => {
      throw erro;
    });
    const controller = new AlunoLocalidadesController({
      listarCidadesPorUf,
    } as unknown as AlunoLocalidadesService);
    const request = { params: { uf: "DF" } } as Request<BuscarCidadesPorUfDto>;
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const response = { status } as unknown as Response<RespostaApiSucesso<RespostaCidadeDto[]>>;
    const next = jest.fn();

    await controller.listarCidadesPorUf(request, response, next);

    expect(next).toHaveBeenCalledWith(erro);
    expect(status).toHaveBeenCalledWith(200);
    expect(json).not.toHaveBeenCalled();
  });
});
