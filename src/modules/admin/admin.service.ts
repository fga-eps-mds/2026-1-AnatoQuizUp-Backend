import type { PerfilUsuario } from "@prisma/client";

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
  mapearStatusApiParaStatusBanco,
  type AlterarStatusUserDto,
  type ContextoAdminDto,
} from "./dto/alterar.status_user.types";
import {
  converterParaRespostaUser,
  type RespostaUserDto,
} from "./dto/resposta.user.types";
import type { UserRepository } from "./admin.repository";

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

  async alterarStatus(
    id: string,
    input: AlterarStatusUserDto,
    admin: ContextoAdminDto,
  ): Promise<RespostaUserDto> {
    // this.validarContextoAdmin(admin);

    const usuario = await this.userRepository.buscarPorId(id);

    if (!usuario) {
      throw new ErroAplicacao({
        codigoStatus: 404,
        codigo: CodigoDeErro.NAO_ENCONTRADO,
        mensagem: MENSAGENS.usuarioNaoEncontrado,
        detalhes: { id },
      });
    }

    if (usuario.perfil === "ADMIN") {
      throw new ErroAplicacao({
        codigoStatus: 403,
        codigo: CodigoDeErro.PROIBIDO,
        mensagem: MENSAGENS.usuarioAdminNaoPodeSerAlterado,
        detalhes: { id },
      });
    }

    const novoStatus = mapearStatusApiParaStatusBanco(input.status);

    if (admin.id === usuario.id && novoStatus === "INATIVO") {
      throw new ErroAplicacao({
        codigoStatus: 403,
        codigo: CodigoDeErro.PROIBIDO,
        mensagem: MENSAGENS.usuarioAutoDesativacaoNaoPermitida,
        detalhes: { id },
      });
    }

    this.validarTransicaoStatus(usuario.status, novoStatus, usuario.perfil);

    const registrarAprovacao =
      usuario.status === "PENDENTE" &&
      usuario.perfil === "PROFESSOR" &&
      (novoStatus === "ATIVO" || novoStatus === "INATIVO");

    const usuarioAtualizado = await this.userRepository.atualizarStatus(
      id,
      novoStatus,
      registrarAprovacao ? admin.id ?? undefined : undefined,
    );

    return converterParaRespostaUser(usuarioAtualizado);
  }

  // private validarContextoAdmin(admin: ContextoAdminDto) {
  //   if (!admin.id || admin.perfil !== "ADMIN") {
  //     throw new ErroAplicacao({
  //       codigoStatus: 403,
  //       codigo: CodigoDeErro.PROIBIDO,
  //       mensagem: MENSAGENS.contextoAdminObrigatorio,
  //     });
  //   }
  // }

  private validarTransicaoStatus(
    statusAtual: ListarUsersDto["status"],
    novoStatus: ListarUsersDto["status"],
    perfil: PerfilUsuario,
  ) {
    if (statusAtual === "PENDENTE") {
      if (perfil !== "PROFESSOR") {
        throw new ErroAplicacao({
          codigoStatus: 409,
          codigo: CodigoDeErro.CONFLITO,
          mensagem: MENSAGENS.usuarioStatusInvalido,
          detalhes: { statusAtual, novoStatus, perfil },
        });
      }

      if (novoStatus === "ATIVO" || novoStatus === "INATIVO") {
        return;
      }
    }

    if (statusAtual === "ATIVO" && novoStatus === "INATIVO") {
      return;
    }

    if (statusAtual === "INATIVO" && novoStatus === "ATIVO") {
      return;
    }

    throw new ErroAplicacao({
      codigoStatus: 409,
      codigo: CodigoDeErro.CONFLITO,
      mensagem: MENSAGENS.usuarioStatusInvalido,
      detalhes: { statusAtual, novoStatus, perfil },
    });
  }
}
