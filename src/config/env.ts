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
    JWT_SECRET_KEY: z.string(),
    JWT_REFRESH_SECRET_KEY: z.string()
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  throw new Error(
    `Invalid environment variables: ${JSON.stringify(parsedEnv.error.flatten().fieldErrors)}`,
  );
}

export const env  = parsedEnv.data;


type CustomEnv = {
  JWT_SECRET_KEY: string;
  JWT_REFRESH_SECRET_KEY: string;
  PORT: number;
}

function getEnvVariable(key: keyof CustomEnv): string | number {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Environment variable ${key} is not set.`);
    }
    if (key === 'PORT') {
        return parseInt(value, 10);
    }
    return value;
}

export const jwtSecretKey = getEnvVariable("JWT_SECRET_KEY") as string;
export const jwtRefreshSecretKey = getEnvVariable("JWT_REFRESH_SECRET_KEY") as string;