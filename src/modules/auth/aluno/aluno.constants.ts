export const VALOR_NAO_SE_APLICA = "Não se aplica";

export const ESTADOS_BRASILEIROS = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
] as const;

export const ESCOLARIDADES_ALUNO = [
  "ENSINO_FUNDAMENTAL",
  "ENSINO_MEDIO",
  "GRADUACAO",
  "POS_GRADUACAO",
  "OUTRO",
] as const;

export type EscolaridadeAluno = (typeof ESCOLARIDADES_ALUNO)[number];
