import { describe, expect, it } from "vitest";

import { AlunoOpcoesAcademicasService } from "@/modules/auth/aluno/opcoes-academicas/opcoes-academicas.service";
import {
  CURSOS_ALUNO_OPCOES,
  ESCOLARIDADES_ALUNO_OPCOES,
  INSTITUICOES_ALUNO_OPCOES,
  PERIODOS_ALUNO_OPCOES,
  VALOR_NAO_SE_APLICA,
} from "@/shared/constants/opcoes-academicas";

describe("AlunoOpcoesAcademicasService", () => {
  const service = new AlunoOpcoesAcademicasService();

  it("lista opcoes academicas para o frontend", () => {
    expect(service.listarOpcoesAcademicas()).toEqual({
      escolaridades: ESCOLARIDADES_ALUNO_OPCOES,
      instituicoes: INSTITUICOES_ALUNO_OPCOES,
      cursos: CURSOS_ALUNO_OPCOES,
      periodos: PERIODOS_ALUNO_OPCOES,
      naoSeAplica: VALOR_NAO_SE_APLICA,
    });
  });
});

