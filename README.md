# AnatoQuizUp API

API inicial do projeto AnatoQuizUp usando `Node.js`, `TypeScript`, `Express`, `Prisma` e `PostgreSQL`.

## Stack

- Node.js 24+ (LTS recomendado)
- TypeScript
- Express
- Prisma ORM
- PostgreSQL 18
- Docker Compose para banco local
- ESLint + Prettier

## Estrutura

```text
anatoquizup-api/
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── config/
│   ├── modules/
│   │   └── exemplo/
│   ├── shared/
│   └── server.ts
├── tests/
│   └── unit/
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── eslint.config.js
├── package.json
└── tsconfig.json
```

## Setup local

1. Copie o arquivo de ambiente:

```bash
cp .env.example .env
```

No PowerShell, voce pode usar:

```powershell
Copy-Item .env.example .env
```

As credenciais do PostgreSQL usadas pelo Docker Compose ficam no arquivo `.env`, via `POSTGRES_USER` e `POSTGRES_PASSWORD`.

2. Suba o banco local:

```bash
docker compose up -d db
```

Se o comando falhar no Windows, verifique se o Docker Desktop esta aberto e com o daemon ativo.

Se voce estiver atualizando um ambiente local antigo que usava outra major do PostgreSQL, pode ser necessario recriar o volume Docker ou executar uma migracao de dados antes de subir o banco com a nova imagem.

3. Gere o client do Prisma:

```bash
npm run prisma:generate
```

No PowerShell deste ambiente, prefira `npm.cmd` se `npm` estiver bloqueado:

```powershell
npm.cmd run prisma:generate
```

4. Execute a migration inicial:

```bash
npm run prisma:migrate -- --name init
```

5. Rode o seed:

```bash
npm run prisma:seed
```

6. Inicie a API em desenvolvimento:

```bash
npm run dev
```

## Scripts

- `npm run dev`: sobe a API com `tsx watch`
- `npm run build`: compila TypeScript para `dist`
- `npm run start`: executa a build gerada
- `npm run lint`: roda o ESLint
- `npm run format`: formata o projeto com Prettier
- `npm run prisma:generate`: gera o client do Prisma
- `npm run prisma:migrate`: executa `prisma migrate dev`
- `npm run prisma:seed`: popula dados iniciais
- `npm run db:up`: sobe o PostgreSQL via Docker Compose
- `npm run db:down`: derruba os containers locais

## Rotas iniciais

- `GET /health`
- `POST /api/v1/exemplos`
- `GET /api/v1/exemplos`
- `GET /api/v1/exemplos/:id`

## Exemplo de payload

### Criar exemplo

```json
{
  "nome": "Questao introdutoria",
  "descricao": "Primeiro registro da API"
}
```

### Resposta esperada

```json
{
  "message": "Exemplo criado com sucesso.",
  "data": {
    "id": "cm1234567890",
    "nome": "Questao introdutoria",
    "descricao": "Primeiro registro da API",
    "createdAt": "2026-04-12T12:00:00.000Z",
    "updatedAt": "2026-04-12T12:00:00.000Z"
  }
}
```

## Observacoes

- Esta primeira entrega nao inclui autenticacao real.
- Esta primeira entrega nao inclui integracoes de IA.
- A pasta de testes foi preservada, mas a suite automatizada ainda nao foi adicionada.
