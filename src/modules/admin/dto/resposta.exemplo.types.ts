import type { Exemplo } from "@prisma/client";

import type { Nullable } from "@/shared/types/comuns.types";
import { converterParaIsoString } from "@/shared/utils/dados.util";

export type RespostaExemploDto = {
  id: string;
  nome: string;
  descricao: Nullable<string>;
  createdAt: string;
  updatedAt: string;
};

export function converterParaRespostaExemplo(exemplo: Exemplo): RespostaExemploDto {
  return {
    id: exemplo.id,
    nome: exemplo.nome,
    descricao: exemplo.descricao,
    createdAt: converterParaIsoString(exemplo.createdAt),
    updatedAt: converterParaIsoString(exemplo.updatedAt),
  };
}
