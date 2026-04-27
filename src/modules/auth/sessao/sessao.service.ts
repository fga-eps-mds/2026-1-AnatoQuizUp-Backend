import bcrypt from "bcryptjs";

import type {
  LoginDto,
  RespostaLoginDto,
  RespostaUsuarioAutenticadoDto,
  UsuarioSessaoDto,
} from "@/modules/auth/sessao/dto/login.types";
import type { SessaoRepository, UsuarioSessao } from "@/modules/auth/sessao/sessao.repository";
import { MENSAGENS } from "@/shared/constants/mensagens";
import { STATUS } from "@/shared/constants/status";
import { CodigoDeErro } from "@/shared/errors/codigos-de-erro";
import type { ValorCodigoDeErro } from "@/shared/errors/codigos-de-erro";
import { ErroAplicacao } from "@/shared/errors/erro-aplicacao";
import type { PayloadAutenticacao } from "@/shared/types/autenticacao.types";
import { gerarRefreshToken, gerarTokenDeAcesso } from "@/shared/utils/jwt";

const DIAS_EXPIRACAO_REFRESH_TOKEN = 7;

function adicionarDias(data: Date, dias: number) {
  const novaData = new Date(data);
  novaData.setUTCDate(novaData.getUTCDate() + dias);
  return novaData;
}

function criarErroNaoAutorizado(mensagem: string) {
  return new ErroAplicacao({
    codigoStatus: 401,
    codigo: CodigoDeErro.NAO_AUTORIZADO,
    mensagem,
  });
}

function criarErroAcessoProibido(codigo: ValorCodigoDeErro, mensagem: string) {
  return new ErroAplicacao({
    codigoStatus: 403,
    codigo,
    mensagem,
  });
}

function criarErroTokenInvalido() {
  return new ErroAplicacao({
    codigoStatus: 401,
    codigo: CodigoDeErro.TOKEN_INVALIDO,
    mensagem: MENSAGENS.tokenInvalido,
  });
}

function converterParaUsuarioSessaoDto(usuario: UsuarioSessao): UsuarioSessaoDto {
  return {
    id: usuario.id,
    nome: usuario.nome,
    nickname: usuario.nickname,
    email: usuario.email,
    papel: usuario.papel,
    status: usuario.status,
    instituicao: usuario.instituicao,
    curso: usuario.curso,
    periodo: usuario.periodo,
    semVinculoAcademico: usuario.semVinculoAcademico,
    dataNascimento: usuario.dataNascimento
      ? usuario.dataNascimento.toISOString().slice(0, 10)
      : null,
    nacionalidade: usuario.nacionalidade,
    cidade: usuario.cidade,
    estado: usuario.estado,
    escolaridade: usuario.escolaridade,
    departamento: usuario.departamento,
    siape: usuario.siape,
    aprovadoPorId: usuario.aprovadoPorId,
    aprovadoEm: usuario.aprovadoEm ? usuario.aprovadoEm.toISOString() : null,
    createdAt: usuario.createdAt.toISOString(),
    updatedAt: usuario.updatedAt.toISOString(),
  };
}

export class SessaoService {
  constructor(private readonly sessaoRepository: SessaoRepository) {}

  async login(input: LoginDto): Promise<RespostaLoginDto> {
    const email = input.email.trim().toLowerCase();
    const usuario = await this.sessaoRepository.buscarUsuarioPorEmail(email);

    if (!usuario || usuario.excluidoEm) {
      throw criarErroNaoAutorizado(MENSAGENS.credenciaisInvalidas);
    }

    const senhaValida = await bcrypt.compare(input.senha, usuario.senhaHash);

    if (!senhaValida) {
      throw criarErroNaoAutorizado(MENSAGENS.credenciaisInvalidas);
    }

    if (usuario.status === STATUS.PENDENTE) {
      throw criarErroAcessoProibido(
        CodigoDeErro.CADASTRO_EM_ANALISE,
        MENSAGENS.cadastroEmAnalise,
      );
    }

    if (usuario.status === STATUS.INATIVO) {
      throw criarErroAcessoProibido(
        CodigoDeErro.CONTA_DESATIVADA,
        MENSAGENS.contaDesativada,
      );
    }

    if (usuario.status === STATUS.RECUSADO) {
      throw criarErroAcessoProibido(
        CodigoDeErro.CADASTRO_RECUSADO,
        MENSAGENS.cadastroRecusado,
      );
    }

    const payload: PayloadAutenticacao = {
      id: usuario.id,
      email: usuario.email,
      papel: usuario.papel,
      status: usuario.status,
    };
    const accessToken = gerarTokenDeAcesso(payload);
    const refreshToken = gerarRefreshToken(payload);

    await this.sessaoRepository.salvarRefreshToken(
      usuario.id,
      refreshToken,
      adicionarDias(new Date(), DIAS_EXPIRACAO_REFRESH_TOKEN),
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async obterUsuarioAutenticado(usuarioId: string): Promise<RespostaUsuarioAutenticadoDto> {
    const usuario = await this.sessaoRepository.buscarUsuarioPorId(usuarioId);

    if (!usuario || usuario.excluidoEm) {
      throw criarErroTokenInvalido();
    }

    return {
      usuario: converterParaUsuarioSessaoDto(usuario),
    };
  }
}
