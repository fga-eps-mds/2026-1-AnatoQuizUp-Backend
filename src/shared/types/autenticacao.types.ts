import type { Papel } from "../constants/papeis";
import type { Status } from "../constants/status";

export type PayloadAutenticacao = {
  id: string;
  email: string;
  papel: Papel;
  status: Status;
};

export type UsuarioAutenticado = {
  id: string;
  email: string;
  papel: Papel;
};

export type UsuarioAutenticadoExpress = {
  userId: string;
  email: string;
  role: Papel;
};
