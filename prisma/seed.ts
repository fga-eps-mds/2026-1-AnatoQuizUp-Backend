import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.exemplo.deleteMany();

  await prisma.exemplo.createMany({
    data: [
      {
        nome: "Questao introdutoria",
        descricao: "Primeiro registro para validar a estrutura inicial da API.",
      },
      {
        nome: "Questao de anatomia basica",
        descricao: "Segundo registro usado no seed local.",
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Falha ao executar o seed.", error);
    await prisma.$disconnect();
    process.exit(1);
  });
