
import { AlunoLocalidadesService } from "@/modules/auth/aluno/localidades/localidades.service";

describe("AlunoLocalidadesService", () => {
  const service = new AlunoLocalidadesService();

  it("lista os estados brasileiros", () => {
    expect(service.listarEstados()).toHaveLength(27);
    expect(service.listarEstados()).toEqual(
      expect.arrayContaining([expect.objectContaining({ sigla: "DF", nome: "Distrito Federal" })]),
    );
  });

  it("lista cidades da UF informada", () => {
    expect(service.listarCidadesPorUf("DF")).toEqual([{ nome: "Brasilia", uf: "DF" }]);
  });
});
