export const PAPEIS = {
  ALUNO: "ALUNO",
  PROFESSOR: "PROFESSOR",
  ADMINISTRADOR: "ADMINISTRADOR",
} as const;

export type Papel = (typeof PAPEIS)[keyof typeof PAPEIS];
