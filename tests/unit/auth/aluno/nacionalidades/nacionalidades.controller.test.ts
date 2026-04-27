import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";

import type { NacionalidadesAlunoDto } from "@/modules/auth/aluno/nacionalidades/dto/resposta.nacionalidade.types";
import { AlunoNacionalidadesController } from "@/modules/auth/aluno/nacionalidades/nacionalidades.controller";
import type { AlunoNacionalidadesService } from "@/modules/auth/aluno/nacionalidades/nacionalidades.service";
import { MENSAGENS } from "@/shared/constants/mensagens";
import type { RespostaApiSucesso } from "@/shared/types/api.types";

describe("AlunoNacionalidadesController", () => {
  it("retorna 200 com nacionalidades no formato padrao da API", async () => {
    const nacionalidades: NacionalidadesAlunoDto = ["Brasileiro(a)", "Estrangeiro(a)"];
    const listarNacionalidades = vi
      .fn<AlunoNacionalidadesService["listarNacionalidades"]>()
      .mockReturnValue(nacionalidades);
    const controller = new AlunoNacionalidadesController({
      listarNacionalidades,
    } as unknown as AlunoNacionalidadesService);
    const request = {} as Request;
    const json = vi.fn();
    const status = vi.fn(() => ({ json }));
    const response = { status } as unknown as Response<RespostaApiSucesso<typeof nacionalidades>>;
    const next = vi.fn();

    await controller.listarNacionalidades(request, response, next);

    expect(listarNacionalidades).toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      mensagem: MENSAGENS.nacionalidadesListadas,
      dados: nacionalidades,
    });
    expect(next).not.toHaveBeenCalled();
  });
});

