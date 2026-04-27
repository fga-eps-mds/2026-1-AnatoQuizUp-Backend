import type {
  RespostaCidadeDto,
  RespostaEstadoDto,
} from "@/modules/auth/aluno/localidades/dto/resposta.localidade.types";
import {
  CIDADES_CAPITAIS_POR_UF,
  ESTADOS_BRASIL,
  type UfBrasileira,
} from "@/shared/constants/localidades";

export class AlunoLocalidadesService {
  listarEstados(): RespostaEstadoDto[] {
    return ESTADOS_BRASIL;
  }

  listarCidadesPorUf(uf: UfBrasileira): RespostaCidadeDto[] {
    return CIDADES_CAPITAIS_POR_UF[uf].map((nome) => ({ nome, uf }));
  }
}
