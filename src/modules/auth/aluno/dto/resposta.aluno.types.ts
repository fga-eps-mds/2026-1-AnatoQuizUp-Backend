import type { Papel, StatusUsuario } from "@/shared/constants/papeis";

export type RegistroAluno = {
  id: string;
  nome: string;
  email: string;
  instituicao: string | null;
  curso: string | null;
  periodo: string | null;
  semVinculoAcademico: boolean;
  dataNascimento: Date | null;
  nacionalidade: string | null;
  cidade: string | null;
  estado: string | null;
  escolaridade: string | null;
  papel: Papel;
  status: StatusUsuario;
  createdAt: Date;
  updatedAt: Date;
};

export type RespostaAlunoDto = {
  id: string;
  nome: string;
  email: string;
  instituicao: string | null;
  curso: string | null;
  periodo: string | null;
  semVinculoAcademico: boolean;
  dataNascimento: string | null;
  nacionalidade: string | null;
  cidade: string | null;
  estado: string | null;
  escolaridade: string | null;
  papel: Papel;
  status: StatusUsuario;
  createdAt: string;
  updatedAt: string;
};

export function converterParaRespostaAluno(aluno: RegistroAluno): RespostaAlunoDto {
  return {
    id: aluno.id,
    nome: aluno.nome,
    email: aluno.email,
    instituicao: aluno.instituicao,
    curso: aluno.curso,
    periodo: aluno.periodo,
    semVinculoAcademico: aluno.semVinculoAcademico,
    dataNascimento: aluno.dataNascimento ? aluno.dataNascimento.toISOString().slice(0, 10) : null,
    nacionalidade: aluno.nacionalidade,
    cidade: aluno.cidade,
    estado: aluno.estado,
    escolaridade: aluno.escolaridade,
    papel: aluno.papel,
    status: aluno.status,
    createdAt: aluno.createdAt.toISOString(),
    updatedAt: aluno.updatedAt.toISOString(),
  };
}
