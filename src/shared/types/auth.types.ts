import type { Papel } from "../constants/papeis";
import type { Status } from "../constants/status";

export type AuthPayload = {
  id: string;
  email: string;
  role: Papel;
  status: Status;
};
