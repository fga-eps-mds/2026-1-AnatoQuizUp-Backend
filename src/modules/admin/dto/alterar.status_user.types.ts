import type { PerfilUsuario, StatusUsuario } from "@prisma/client";

export const STATUS_USUARIO_API = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;

export type StatusUsuarioApi =
  (typeof STATUS_USUARIO_API)[keyof typeof STATUS_USUARIO_API];

export type AlterarStatusUserDto = {
  status: StatusUsuarioApi;
};

export type ContextoAdminDto = {
  id: string | null;
  perfil: PerfilUsuario | null;
};

export function mapearStatusApiParaStatusBanco(status: StatusUsuarioApi): StatusUsuario {
  switch (status) {
    case STATUS_USUARIO_API.PENDING:
      return "PENDENTE";
    case STATUS_USUARIO_API.ACTIVE:
      return "ATIVO";
    case STATUS_USUARIO_API.INACTIVE:
      return "INATIVO";
  }
}
