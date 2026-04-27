ALTER TABLE "usuarios" ADD COLUMN "nickname" TEXT;

CREATE UNIQUE INDEX "usuarios_nickname_key" ON "usuarios"("nickname");
