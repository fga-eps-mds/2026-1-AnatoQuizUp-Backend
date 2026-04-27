import { describe, expect, it } from "vitest";

import { schemaBuscarCidadesPorUf } from "@/modules/auth/aluno/localidades/localidades.schemas";

describe("schemaBuscarCidadesPorUf", () => {
  it("normaliza UF para maiusculo", () => {
    expect(schemaBuscarCidadesPorUf.parse({ uf: "df" })).toEqual({ uf: "DF" });
  });

  it("rejeita UF invalida", () => {
    expect(() => schemaBuscarCidadesPorUf.parse({ uf: "XX" })).toThrow();
  });
});
