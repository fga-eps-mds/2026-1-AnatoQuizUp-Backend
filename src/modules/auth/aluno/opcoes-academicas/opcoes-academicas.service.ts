import type { OpcoesAcademicasAlunoDto } from "@/modules/auth/aluno/opcoes-academicas/dto/resposta.opcoes-academicas.types";
import {
  CURSOS_ALUNO_OPCOES,
  ESCOLARIDADES_ALUNO_OPCOES,
  INSTITUICOES_ALUNO_OPCOES,
  PERIODOS_ALUNO_OPCOES,
  VALOR_NAO_SE_APLICA,
} from "@/shared/constants/opcoes-academicas";

export class AlunoOpcoesAcademicasService {
  listarOpcoesAcademicas(): OpcoesAcademicasAlunoDto {
    return {
      escolaridades: [...ESCOLARIDADES_ALUNO_OPCOES],
      instituicoes: [...INSTITUICOES_ALUNO_OPCOES],
      cursos: [...CURSOS_ALUNO_OPCOES],
      periodos: [...PERIODOS_ALUNO_OPCOES],
      naoSeAplica: VALOR_NAO_SE_APLICA,
    };
  }
}
