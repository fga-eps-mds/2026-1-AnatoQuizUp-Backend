import dotenv from "dotenv";
import { z } from "zod";

import { parseCorsOrigins } from "@/config/cors";

dotenv.config();

const ambienteAtual = process.env.NODE_ENV ?? "development";
const ambienteTeste = ambienteAtual === "test";
const DEFAULT_CORS_ORIGINS = ""; //http://localhost:5173,http://127.0.0.1:5173

const variavelObrigatoria = (nome: string) => z.string().min(1, `${nome} is required.`);
const variavelComDefaultDeTeste = (nome: string, valorPadraoTeste: string) =>
  ambienteTeste ? z.string().min(1).default(valorPadraoTeste) : variavelObrigatoria(nome);

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3333),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required."),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
  BREVO_API_KEY: z.string().min(1, "BREVO_API_KEY is required."),
  EMAIL_FROM: z.string().email("EMAIL_FROM must be a valid email."),
  FRONTEND_PROD_URL: z.string().url("FRONTEND_PROD_URL must be a valid URL."),
  JWT_SECRET_KEY: z.string(),
  JWT_REFRESH_SECRET_KEY: z.string(),
  JWT_PASSWORD_REDEFINITION_SECRET_KEY: z.string(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  throw new Error(
    `Invalid environment variables: ${JSON.stringify(z.flattenError(parsedEnv.error).fieldErrors)}`,
  );
}

export const env = parsedEnv.data;

export const jwtSecretKey = env.JWT_SECRET_KEY;
export const jwtRefreshSecretKey = env.JWT_REFRESH_SECRET_KEY;
export const jwtPasswordRedefinitionSecretKey = env.JWT_PASSWORD_REDEFINITION_SECRET_KEY;
