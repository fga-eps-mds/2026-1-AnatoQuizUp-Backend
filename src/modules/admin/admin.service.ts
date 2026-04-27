import { MENSAGENS } from "@/shared/constants/mensagens";
import { CodigoDeErro } from "@/shared/errors/codigos-de-erro";
import { ErroAplicacao } from "@/shared/errors/erro-aplicacao";
import type { RespostaPaginada } from "@/shared/types/api.types";
import {
  montarMetadadosPaginacao,
  resolverParametrosPaginacao,
} from "@/shared/utils/paginacao.util";

import type { ListarUsersDto, ListarUsersQueryDto } from "./dto/listar.users.types";
import {
  converterParaRespostaUser,
  type RespostaUserDto,
} from "./dto/resposta.user.types";
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

  async buscarPorId(id: string): Promise<RespostaUserDto> {
    const usuario = await this.userRepository.buscarPorId(id);

    if (!usuario) {
      throw new ErroAplicacao({
        codigoStatus: 404,
        codigo: CodigoDeErro.NAO_ENCONTRADO,
        mensagem: MENSAGENS.usuarioNaoEncontrado,
        detalhes: { id },
      });
    }

    return converterParaRespostaUser(usuario);
  }
}
