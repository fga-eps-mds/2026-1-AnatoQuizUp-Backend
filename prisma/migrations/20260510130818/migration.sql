-- CreateEnum
CREATE TYPE "Dificuldade" AS ENUM ('FACIL', 'MEDIA', 'DIFICIL');

-- AlterTable
ALTER TABLE "questoes" ADD COLUMN     "dificuldade" "Dificuldade" NOT NULL DEFAULT 'MEDIA',
ALTER COLUMN "saibaMais" DROP NOT NULL;
