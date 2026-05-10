import type { Prisma } from "@prisma/client";

import { prisma } from "@/config/db";
import type { ParametrosPaginacao } from "@/shared/utils/paginacao.util";

import type { CriarQuestaoDto, RegistroQuestaoCompleta } from "./dto/question.types";
import type {
  AlternativasMultiplaEscolhaDto,
  AlternativasVerdadeiroFalsoDto,
} from "./dto/question.types";
import { mapearTipoApiParaBanco } from "./dto/question.types";

type DadosAtualizacaoQuestao = Partial<CriarQuestaoDto>;

const includeQuestaoCompleta = {
  tema: true,
  alternativas: true,
} as const;

export class QuestionRepository {
  async listar(paginacao: ParametrosPaginacao) {
    const where = { excluidoEm: null };

    const [data, total] = await prisma.$transaction([
      prisma.questao.findMany({
        where,
        include: includeQuestaoCompleta,
        skip: paginacao.skip,
        take: paginacao.limit,
        orderBy: {
          criadoEm: "desc",
        },
      }),
      prisma.questao.count({ where }),
    ]);

    return {
      data: data as RegistroQuestaoCompleta[],
      total,
    };
  }

  async buscarPorId(id: string) {
    return prisma.questao.findFirst({
      where: { id, excluidoEm: null },
      include: includeQuestaoCompleta,
    }) as Promise<RegistroQuestaoCompleta | null>;
  }

  async criar(data: CriarQuestaoDto, criadoPorId: string) {
    return prisma.$transaction(async (transacao) => {
      const temaExistente = await transacao.tema.findFirst({
        where: { nome: data.tema, excluidoEm: null },
      });
      const tema = temaExistente ?? (await transacao.tema.create({ data: { nome: data.tema } }));

      const questao = await transacao.questao.create({
        data: {
          enunciado: data.enunciado,
          tipoQuestao: mapearTipoApiParaBanco(data.tipo),
          dificuldade: data.dificuldade,
          respostaCorreta: data.alternativaCorreta,
          saibaMais: data.explicacaoPedagogica,
          urlImagem: data.imagem ?? null,
          criadoPorId,
          temaId: tema.id,
          alternativas: {
            create: this.mapearAlternativas(data),
          },
        },
        include: includeQuestaoCompleta,
      });

      return questao as RegistroQuestaoCompleta;
    });
  }

  async atualizar(id: string, data: DadosAtualizacaoQuestao) {
    return prisma.$transaction(async (transacao) => {
      const tema = data.tema ? await this.buscarOuCriarTema(transacao, data.tema) : null;

      const questao = await transacao.questao.update({
        where: { id },
        data: {
          ...(data.enunciado ? { enunciado: data.enunciado } : {}),
          ...(data.tipo ? { tipoQuestao: mapearTipoApiParaBanco(data.tipo) } : {}),
          ...(data.dificuldade ? { dificuldade: data.dificuldade } : {}),
          ...(data.alternativaCorreta ? { respostaCorreta: data.alternativaCorreta } : {}),
          ...(data.explicacaoPedagogica ? { saibaMais: data.explicacaoPedagogica } : {}),
          ...(Object.prototype.hasOwnProperty.call(data, "imagem")
            ? { urlImagem: data.imagem ?? null }
            : {}),
          ...(tema ? { temaId: tema.id } : {}),
          ...(data.alternativas
            ? {
                alternativas: {
                  upsert: {
                    create: this.mapearAlternativas(data as CriarQuestaoDto),
                    update: this.mapearAlternativas(data as CriarQuestaoDto),
                  },
                },
              }
            : {}),
        },
        include: includeQuestaoCompleta,
      });

      return questao as RegistroQuestaoCompleta;
    });
  }

  async desativar(id: string) {
    return prisma.questao.update({
      where: { id },
      data: {
        status: "INATIVO",
        excluidoEm: new Date(),
      },
      include: includeQuestaoCompleta,
    }) as Promise<RegistroQuestaoCompleta>;
  }

  private mapearAlternativas(data: Pick<CriarQuestaoDto, "tipo" | "alternativas">) {
    if (data.tipo === "VERDADEIRO_FALSO") {
      const alternativas = data.alternativas as AlternativasVerdadeiroFalsoDto;

      return {
        alternativaA: "",
        alternativaB: "",
        alternativaC: alternativas.C,
        alternativaD: "",
        alternativaE: alternativas.E,
      };
    }

    const alternativas = data.alternativas as AlternativasMultiplaEscolhaDto;

    return {
      alternativaA: alternativas.A,
      alternativaB: alternativas.B,
      alternativaC: alternativas.C,
      alternativaD: alternativas.D,
      alternativaE: alternativas.E,
    };
  }

  private async buscarOuCriarTema(transacao: Prisma.TransactionClient, nome: string) {
    const temaExistente = await transacao.tema.findFirst({
      where: { nome, excluidoEm: null },
    });

    return temaExistente ?? transacao.tema.create({ data: { nome } });
  }
}
