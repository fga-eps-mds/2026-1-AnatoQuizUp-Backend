import { Papel } from "../constants/papeis";
import { Status } from "../constants/status";

export type AuthPayload = {
  id: string;
  email: string;
  role: Papel;
  status: Status;
}