import { Papel } from "../constants/papeis";

export type AuthPayload = {
  id: string;
  email: string;
  role: Papel;
  status: string;
}