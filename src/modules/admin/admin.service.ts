import type { RespostaPaginada } from "@/shared/types/api.types";
import {
  montarMetadadosPaginacao,
  resolverParametrosPaginacao,
} from "@/shared/utils/paginacao.util";

import type { ListarUsersDto, ListarUsersQueryDto } from "./dto/listar.users.types";
import { UserRepository } from "./admin.repository";

export class AdminService {
  constructor(private readonly userRepository: UserRepository) {}

  async listar(query: ListarUsersQueryDto): Promise<RespostaPaginada<ListarUsersDto>> {
    const paginacao = resolverParametrosPaginacao(query);
    const { data, total } = await this.userRepository.listar(paginacao);

    return {
      dados: data,
      metadados: montarMetadadosPaginacao(paginacao, total),
    };
  }
}
