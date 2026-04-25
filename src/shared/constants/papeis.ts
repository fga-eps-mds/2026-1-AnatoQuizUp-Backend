export const PAPEIS = {
  ALUNO: "ALUNO",
  PROFESSOR: "PROFESSOR",
  ADMINISTRADOR: "ADMINISTRADOR",
} as const;

export type Papel = (typeof PAPEIS)[keyof typeof PAPEIS];

export const STATUS_USUARIO = {
  ATIVO: "ATIVO",
  INATIVO: "INATIVO",
} as const;

export type StatusUsuario = (typeof STATUS_USUARIO)[keyof typeof STATUS_USUARIO];
