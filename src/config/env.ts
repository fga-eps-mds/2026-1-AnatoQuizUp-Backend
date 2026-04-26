import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

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
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  throw new Error(
    `Invalid environment variables: ${JSON.stringify(parsedEnv.error.flatten().fieldErrors)}`,
  );
}

export const env = parsedEnv.data;
