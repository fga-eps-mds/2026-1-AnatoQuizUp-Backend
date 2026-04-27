import type { UfBrasileira } from "@/shared/constants/localidades";

export type RespostaEstadoDto = {
  sigla: UfBrasileira;
  nome: string;
};

export type RespostaCidadeDto = {
  nome: string;
  uf: UfBrasileira;
};