import type { NacionalidadesAlunoDto } from "@/modules/auth/aluno/nacionalidades/dto/resposta.nacionalidade.types";
import { NACIONALIDADES_ALUNO_OPCOES } from "@/shared/constants/nacionalidades";

export class AlunoNacionalidadesService {
  listarNacionalidades(): NacionalidadesAlunoDto {
    return [...NACIONALIDADES_ALUNO_OPCOES];
  }
}

