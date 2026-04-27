-- AlterEnum
ALTER TYPE "NivelEducacional" ADD VALUE IF NOT EXISTS 'ENSINO_FUNDAMENTAL';

-- AlterTable
ALTER TABLE "usuarios" ALTER COLUMN "semestre" TYPE TEXT USING "semestre"::TEXT;
