import type {
  UsuarioAutenticado,
  UsuarioAutenticadoExpress,
} from "@/shared/types/autenticacao.types";

declare global {
  namespace Express {
    interface Request {
      user?: UsuarioAutenticadoExpress;
      usuario?: UsuarioAutenticado;
    }
  }
}

export {};
