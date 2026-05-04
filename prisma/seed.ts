import { PerfilUsuario, PrismaClient, StatusUsuario } from "@prisma/client";
import bcrypt from "bcryptjs";

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

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@anatoquizup.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";

  const senhaHash = await bcrypt.hash(adminPassword, 10);

  await prisma.usuario.upsert({
    where: {
      email: adminEmail,
    },
    update: {
      nome: "Administrador",
      senha: senhaHash,
      perfil: PerfilUsuario.ADMIN,
      status: StatusUsuario.ATIVO,
    },
    create: {
      nome: "Administrador",
      email: adminEmail,
      senha: senhaHash,
      perfil: PerfilUsuario.ADMIN,
      status: StatusUsuario.ATIVO,
    },
  });

  const professorEmail = process.env.PROFESSOR_EMAIL ?? "professor@anatoquizup.com";
  const professorPassword = process.env.PROFESSOR_PASSWORD ?? "professor123";

  const senhaProfessorHash = await bcrypt.hash(professorPassword, 10);

  await prisma.usuario.upsert({
    where: { email: professorEmail },
    update: {
      nome: "Professor Seed",
      senha: senhaProfessorHash,
      perfil: PerfilUsuario.PROFESSOR,
      status: StatusUsuario.ATIVO,
      departamento: "Departamento de Anatomia",
      siape: "0000001",
    },
    create: {
      nome: "Professor Seed",
      email: professorEmail,
      senha: senhaProfessorHash,
      perfil: PerfilUsuario.PROFESSOR,
      status: StatusUsuario.ATIVO,
      departamento: "Departamento de Anatomia",
      siape: "0000001",
    },
  });

  console.log("Seed executado com sucesso.");
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
