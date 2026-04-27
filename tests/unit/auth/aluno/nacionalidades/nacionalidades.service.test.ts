
import { AlunoNacionalidadesService } from "@/modules/auth/aluno/nacionalidades/nacionalidades.service";
import { NACIONALIDADES_ALUNO_OPCOES } from "@/shared/constants/nacionalidades";

describe("AlunoNacionalidadesService", () => {
  const service = new AlunoNacionalidadesService();

  it("lista nacionalidades para o frontend", () => {
    expect(service.listarNacionalidades()).toEqual(NACIONALIDADES_ALUNO_OPCOES);
  });
});

