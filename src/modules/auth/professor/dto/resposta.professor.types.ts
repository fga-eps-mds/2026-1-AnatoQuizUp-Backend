import type { Papel, StatusUsuario } from "@/shared/constants/papeis";

export type RegistroProfessor = {
  id: string;
  nome: string;
  email: string;
  instituicao: string | null;
  departamento: string | null;
  curso: string | null;
  siape: string | null;
  papel: Papel;
  status: StatusUsuario;
  criadoEm: Date;
  atualizadoEm: Date;
};

export type RespostaProfessorDto = {
  id: string;
  nome: string;
  email: string;
  instituicao: string | null;
  departamento: string | null;
  curso: string | null;
  siape: string | null;
  papel: Papel;
  status: StatusUsuario;
  criadoEm: string;
  atualizadoEm: string;
};

export function converterParaRespostaProfessor(
  professor: RegistroProfessor,
): RespostaProfessorDto {
  return {
    id: professor.id,
    nome: professor.nome,
    email: professor.email,
    instituicao: professor.instituicao,
    departamento: professor.departamento,
    curso: professor.curso,
    siape: professor.siape,
    papel: professor.papel,
    status: professor.status,
    criadoEm: professor.criadoEm.toISOString(),
    atualizadoEm: professor.atualizadoEm.toISOString(),
  };
}
