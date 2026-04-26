import type { Papel } from "../constants/papeis";

export type PayloadAutenticacao = {
  id: string;
  email: string;
  papel: Papel;
  status: string;
};
