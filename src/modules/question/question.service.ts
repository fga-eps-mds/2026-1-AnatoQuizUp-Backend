import { MENSAGENS } from "@/shared/constants/mensagens";
import { CodigoDeErro } from "@/shared/errors/codigos-de-erro";
import { ErroAplicacao } from "@/shared/errors/erro-aplicacao";
import type { RespostaPaginada } from "@/shared/types/api.types";
import {
  montarMetadadosPaginacao,
  resolverParametrosPaginacao,
} from "@/shared/utils/paginacao.util";

import type {
  AtualizarQuestaoDto,
  CriarQuestaoDto,
  ListarQuestoesQueryDto,
  RespostaQuestaoDto,
} from "./dto/question.types";
import {
  TIPO_QUESTAO_API,
  converterParaRespostaQuestao,
  mapearTipoBancoParaApi,
} from "./dto/question.types";
import type { QuestionRepository } from "./question.repository";

export class QuestionService {
  constructor(private readonly questionRepository: QuestionRepository) {}

  async listar(query: ListarQuestoesQueryDto): Promise<RespostaPaginada<RespostaQuestaoDto>> {
    const paginacao = resolverParametrosPaginacao(query);
    const { data, total } = await this.questionRepository.listar(paginacao);

    return {
      dados: data.map(converterParaRespostaQuestao),
      metadados: montarMetadadosPaginacao(paginacao, total),
    };
  }

  async buscarPorId(id: string): Promise<RespostaQuestaoDto> {
    const questao = await this.questionRepository.buscarPorId(id);

    if (!questao) {
      throw this.erroQuestaoNaoEncontrada(id);
    }

    return converterParaRespostaQuestao(questao);
  }

  async criar(data: CriarQuestaoDto, criadoPorId: string): Promise<RespostaQuestaoDto> {
    if (!criadoPorId) {
      throw new ErroAplicacao({
        codigoStatus: 401,
        codigo: CodigoDeErro.NAO_AUTORIZADO,
        mensagem: MENSAGENS.tokenInvalido,
      });
    }

    this.validarQuestao(data);

    const questao = await this.questionRepository.criar(data, criadoPorId);

    return converterParaRespostaQuestao(questao);
  }

  async atualizar(id: string, data: AtualizarQuestaoDto): Promise<RespostaQuestaoDto> {
    const questao = await this.questionRepository.buscarPorId(id);

    if (!questao) {
      throw this.erroQuestaoNaoEncontrada(id);
    }

    const dataNormalizada = {
      ...data,
      tipo: data.tipo ?? mapearTipoBancoParaApi(questao.tipoQuestao),
      alternativaCorreta: data.alternativaCorreta ?? questao.respostaCorreta,
      alternativas: data.alternativas ?? this.extrairAlternativasAtuais(questao),
    };

    this.validarQuestao(dataNormalizada as CriarQuestaoDto);

    const questaoAtualizada = await this.questionRepository.atualizar(id, {
      ...data,
      ...(data.alternativas && !data.tipo ? { tipo: dataNormalizada.tipo } : {}),
    });

    return converterParaRespostaQuestao(questaoAtualizada);
  }

  async remover(id: string): Promise<RespostaQuestaoDto> {
    const questao = await this.questionRepository.buscarPorId(id);

    if (!questao) {
      throw this.erroQuestaoNaoEncontrada(id);
    }

    const questaoRemovida = await this.questionRepository.desativar(id);

    return converterParaRespostaQuestao(questaoRemovida);
  }

  private validarQuestao(data: CriarQuestaoDto) {
    if (!data.alternativaCorreta) {
      throw new ErroAplicacao({
        codigoStatus: 400,
        codigo: CodigoDeErro.ERRO_DE_VALIDACAO,
        mensagem: MENSAGENS.questaoGabaritoObrigatorio,
      });
    }

    if (!data.alternativas || Object.keys(data.alternativas).length === 0) {
      throw new ErroAplicacao({
        codigoStatus: 400,
        codigo: CodigoDeErro.ERRO_DE_VALIDACAO,
        mensagem: MENSAGENS.questaoAlternativasObrigatorias,
      });
    }

    if (data.tipo === TIPO_QUESTAO_API.MULTIPLA_ESCOLHA) {
      const alternativasObrigatorias = ["A", "B", "C", "D", "E"] as const;
      const possuiTodas = alternativasObrigatorias.every((alternativa) => {
        const valor = data.alternativas[alternativa as keyof typeof data.alternativas];

        return typeof valor === "string" && valor.trim().length > 0;
      });

      if (!possuiTodas) {
        throw new ErroAplicacao({
          codigoStatus: 400,
          codigo: CodigoDeErro.ERRO_DE_VALIDACAO,
          mensagem: MENSAGENS.questaoAlternativasObrigatorias,
        });
      }
    }

    if (data.tipo === TIPO_QUESTAO_API.VERDADEIRO_FALSO) {
      const alternativas = data.alternativas;
      const possuiVerdadeiroFalso =
        typeof alternativas.C === "string" &&
        alternativas.C.trim().length > 0 &&
        typeof alternativas.E === "string" &&
        alternativas.E.trim().length > 0;

      if (!possuiVerdadeiroFalso) {
        throw new ErroAplicacao({
          codigoStatus: 400,
          codigo: CodigoDeErro.ERRO_DE_VALIDACAO,
          mensagem: MENSAGENS.questaoAlternativasObrigatorias,
        });
      }

      if (data.alternativaCorreta !== "C" && data.alternativaCorreta !== "E") {
        throw new ErroAplicacao({
          codigoStatus: 400,
          codigo: CodigoDeErro.ERRO_DE_VALIDACAO,
          mensagem: MENSAGENS.questaoGabaritoObrigatorio,
        });
      }
    }
  }

  private erroQuestaoNaoEncontrada(id: string) {
    return new ErroAplicacao({
      codigoStatus: 404,
      codigo: CodigoDeErro.NAO_ENCONTRADO,
      mensagem: MENSAGENS.questaoNaoEncontrada,
      detalhes: { id },
    });
  }

  private extrairAlternativasAtuais(
    questao: Awaited<ReturnType<QuestionRepository["buscarPorId"]>>,
  ) {
    if (!questao?.alternativas) {
      return {};
    }

    if (questao.tipoQuestao === "CERTO_ERRADO") {
      return {
        C: questao.alternativas.alternativaC,
        E: questao.alternativas.alternativaE,
      };
    }

    return {
      A: questao.alternativas.alternativaA,
      B: questao.alternativas.alternativaB,
      C: questao.alternativas.alternativaC,
      D: questao.alternativas.alternativaD,
      E: questao.alternativas.alternativaE,
    };
  }
}
