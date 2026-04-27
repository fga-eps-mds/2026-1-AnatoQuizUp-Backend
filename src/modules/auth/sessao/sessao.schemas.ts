import { z } from "zod";

export const schemaLogin = z.object({
  email: z
    .string()
    .trim()
    .max(255)
    .pipe(z.email())
    .transform((email) => email.toLowerCase()),
  senha: z.string().min(1),
});

export const schemaRefreshToken = z.object({
  refreshToken: z.string().trim().min(1),
});

export const schemaLogout = schemaRefreshToken;
