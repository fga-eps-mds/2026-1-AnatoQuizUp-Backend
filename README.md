# AnatoQuizUp Backend

Backend Auth do projeto **AnatoQuizUp**: autenticação, identidade, administração de usuários e persistência do banco de autenticação. Usa `Node.js`, `TypeScript`, `Express`, `Prisma` e `PostgreSQL`.

> **A partir de 2026-05-05** este serviço deixou de ser exposto publicamente. Em produção fica em **rede privada** e aceita somente requisições vindas do **BFF** (`fga-eps-mds/2026-1-AnatoQuizUp-BFF`) com header `X-Internal-Token` válido. Em desenvolvimento, o BFF roda em paralelo na porta `4000` e o Frontend aponta para ele.

## Stack

- Node.js 24+ (LTS recomendado)
- TypeScript
- Express 5
- Prisma ORM
- PostgreSQL 18 (via Docker Compose para dev local)
- Pino (logs), Helmet, CORS
- bcryptjs (hash de senha)
- jsonwebtoken (access + refresh tokens)
- Zod (validação)
- Brevo (envio transacional de email — recuperação de senha)
- Jest (testes), ESLint, Prettier

## Pré-requisitos

| Ferramenta | Versão | Como instalar |
|---|---|---|
| Node.js | ≥ 24.0.0 | https://nodejs.org/ ou `nvm install 24` |
| npm | que vem com o Node | — |
| Docker Desktop | recente | https://www.docker.com/products/docker-desktop/ — **deve estar aberto e rodando** |
| Git | qualquer recente | https://git-scm.com/ |
| GNU Make | opcional, mas recomendado | Windows: `choco install make` ou `scoop install make`; Mac: `brew install make`; Linux: já vem |

> Se preferir não usar Make, todos os atalhos têm equivalente em `npm run ...` documentado abaixo.

## Setup local — passo a passo (zero a rodando)

### 1. Clonar e entrar no repo

```powershell
git clone https://github.com/fga-eps-mds/2026-1-AnatoQuizUp-Backend.git
cd 2026-1-AnatoQuizUp-Backend
```

### 2. Criar e preencher o `.env`

```powershell
Copy-Item .env.example .env
```

> ⚠️ **Erro frequente:** se você não criar o `.env`, o Prisma falha com `Missing required environment variable: DATABASE_URL`. O arquivo `.env.example` é só template e **não** é lido automaticamente pelo `dotenv`.

Abra o `.env` e preencha **todas** as variáveis. Para dev local, valores sugeridos:

```dotenv
NODE_ENV=development
PORT=3333

# Postgres (dev local) — precisam ser preenchidos, senão o container não sobe
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=postgres

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres?schema=public"
LOG_LEVEL=info

# JWT (use valores aleatórios em prod; no dev qualquer string vale)
JWT_SECRET_KEY=dev-jwt-secret-anatoquizup-local
JWT_REFRESH_SECRET_KEY=dev-jwt-refresh-secret-anatoquizup-local
JWT_PASSWORD_REDEFINITION_SECRET_KEY=dev-jwt-password-redefinition-secret-anatoquizup-local

# Token compartilhado com o BFF — DEVE ser idêntico ao que está no BFF
INTERNAL_TOKEN=<gere com: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">

# Email (Brevo) — em dev local pode ficar com placeholder; só importa se for testar fluxo de email
BREVO_API_KEY=dev-brevo-key-not-used-locally
EMAIL_FROM=noreply@anatoquizup.local
FRONTEND_PROD_URL=http://localhost:5173

# CORS — em dev, libera o front e o BFF
CORS_ORIGINS=http://localhost:5173,http://localhost:4000
```

> ⚠️ **Erro frequente:** se `POSTGRES_USER`, `POSTGRES_PASSWORD` ou `POSTGRES_DB` ficarem em branco, o container do Postgres entra em **loop de restart** com a mensagem `Database is uninitialized and superuser password is not specified`.

### 3. Subir o banco

Confirme que o **Docker Desktop está aberto** (no Windows verifique a baleia na bandeja do sistema), depois:

```bash
docker compose up -d db
```

Verifique se subiu saudável:

```bash
docker ps --filter "name=anatoquizup-postgres"
# Deve listar a coluna STATUS como "Up X seconds/minutes"
```

> Se aparecer `Restarting`, rode `docker logs anatoquizup-postgres --tail 20` para diagnóstico (geralmente `.env` não preenchido — volte ao passo 2).

### 4. Instalar dependências e gerar o Prisma Client

```bash
npm ci
npm run prisma:generate
```

### 5. Aplicar migrations e popular o admin

```bash
npm run prisma:migrate
npm run prisma:seed
```

### 6. Iniciar a API em modo desenvolvimento

```bash
npm run dev
```

A API fica em `http://localhost:3333`. Health check: `GET http://localhost:3333/health`.

## Atalhos com Make

Se você tiver o `make` instalado:

```bash
make help        # lista todos os comandos
make setup       # instala deps, copia .env.example, sobe DB, gera prisma e roda seed
make dev         # sobe a API em watch mode
make test        # testes
make test-ci     # testes com cobertura (gate de 85%)
make lint        # ESLint
make build       # compila para dist/
make db-up       # docker compose up -d db
make db-down     # para o banco
make db-reset    # apaga volume e recria o banco do zero
make db-logs     # logs do container
make prisma-all  # generate + migrate + seed
```

## Equivalência sem Make

| Make | npm |
|---|---|
| `make dev` | `npm run dev` |
| `make test` | `npm test` |
| `make test-ci` | `npm run test:ci` (não existe — use `npm test -- --coverage --runInBand`) |
| `make lint` | `npm run lint` |
| `make build` | `npm run build` |
| `make db-up` | `docker compose up -d db` |
| `make db-down` | `docker compose down` |
| `make db-reset` | `docker compose down -v && docker compose up -d db` |
| `make prisma-all` | `npm run prisma:generate && npm run prisma:migrate && npm run prisma:seed` |

## Rotas atualmente expostas pelo Backend/Auth

> Todas as rotas `/api/*` exigem o header `X-Internal-Token` (validação no middleware `middlewareTokenInterno`). Apenas `GET /health` é público.

- `GET /health`
- `POST /api/v1/autenticacao/login`
- `POST /api/v1/autenticacao/atualizar-token`
- `GET /api/v1/autenticacao/usuario-atual`
- `POST /api/v1/autenticacao/sair`
- `POST /api/v1/autenticacao/cadastro`
- `POST /api/v1/autenticacao/recuperar-senha`
- `POST /api/v1/autenticacao/redefinir-senha`
- `GET /api/v1/autenticacao/alunos/...` (nacionalidades, opções acadêmicas, localidades, disponibilidade)
- `GET|PATCH /api/v1/admin/usuarios[/:id[/status]]`
- `POST|GET /api/v1/exemplos[/:id]`

As rotas de questões não pertencem mais a este serviço; o BFF encaminha `/api/v1/questoes/*` para o Quiz-Service. Detalhes de payload em [docs/arquitetura/api/](https://fga-eps-mds.github.io/2026-1-AnatoQuizUp-Doc/) (gerado a partir do repo Doc).

## Estrutura do projeto

```text
2026-1-AnatoQuizUp-Backend/
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts                      # cria 1 admin
├── src/
│   ├── config/
│   │   ├── app.ts                   # monta Express, CORS, helmet, rotas, error handler
│   │   ├── cors.ts
│   │   ├── db.ts                    # PrismaClient singleton
│   │   ├── env.ts                   # validação de env com Zod
│   │   └── logger.ts                # Pino + pino-http
│   ├── modules/
│   │   ├── admin/                   # CRUD/aprovação de usuários
│   │   ├── auth/                    # aluno, sessão, recuperar-senha, localidades
│   │   └── exemplo/                 # módulo de referência didático
│   ├── shared/
│   │   ├── constants/
│   │   ├── errors/
│   │   ├── middlewares/
│   │   │   ├── autenticacao.middleware.ts
│   │   │   ├── token-interno.middleware.ts   # valida X-Internal-Token
│   │   │   ├── tratamento-erros.middleware.ts
│   │   │   └── validacao.middleware.ts
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   └── server.ts                    # bootstrap + graceful shutdown
├── tests/
├── .env.example
├── docker-compose.yml               # apenas Postgres
├── Dockerfile                       # multi-stage para deploy
├── jest.config.cjs
├── prisma.config.ts
└── tsconfig.json
```

## Acesso em produção (e em dev opcional)

Em produção, este serviço fica em rede privada (Railway internal networking) e aceita somente:

- `GET /health` — sempre público (health check do Railway).
- `/api/*` — exige header `X-Internal-Token: <segredo>` igual ao `INTERNAL_TOKEN` configurado.

Se um cliente externo (curl, browser, outro serviço) tentar acessar `/api/*` sem o token, a resposta é `403 PROIBIDO`.

Em dev local, é possível pular o BFF e testar o Backend diretamente, desde que envie o `X-Internal-Token`:

```bash
curl http://localhost:3333/api/v1/autenticacao/login \
  -H "Content-Type: application/json" \
  -H "X-Internal-Token: <valor-do-INTERNAL_TOKEN>" \
  -d '{"email":"...","senha":"..."}'
```

O caminho recomendado, porém, é subir o BFF (porta 4000) e bater nele — assim você reproduz o ambiente de produção.

## Troubleshooting (erros que já apareceram durante setup)

| Sintoma | Causa | Solução |
|---|---|---|
| `Missing required environment variable: DATABASE_URL` ao rodar Prisma | Não existe `.env` | `Copy-Item .env.example .env` e preencher |
| Container `anatoquizup-postgres` em loop de `Restarting` | `POSTGRES_PASSWORD` vazio no `.env` | Preencher `POSTGRES_USER/PASSWORD/DB` no `.env` e rodar `docker compose down -v && docker compose up -d db` |
| `P1001: Can't reach database server at localhost:5432` | Banco não subiu ou não terminou de inicializar | Rode `docker ps` e confirme status `Up`; aguarde 5-10s após `compose up`; se persistir, veja `docker logs anatoquizup-postgres` |
| `403 Token interno ausente` em chamadas `/api/v1/*` | Esqueceu de enviar `X-Internal-Token` | Cliente HTTP precisa injetar o header. Em dev, o BFF cuida disso automaticamente. Para curl direto, passar `-H "X-Internal-Token: ..."` |
| `npm` ou `node` não reconhecidos no PowerShell | Node não instalado ou não no PATH | Reinstalar via https://nodejs.org/ ou `nvm use 24` |
| `EBADENGINE` warning na instalação | Sua versão de Node é < 24 | Funcionará mesmo assim em Node 20+, mas atualize quando puder |

## Scripts npm disponíveis

- `npm run dev` — sobe a API com `tsx watch`
- `npm run build` — compila TypeScript para `dist`
- `npm run start` — roda a build (em produção)
- `npm run lint` — ESLint
- `npm run format` — Prettier
- `npm test` — Jest
- `npm run prisma:generate` — gera o client do Prisma
- `npm run prisma:migrate` — `prisma migrate dev`
- `npm run prisma:seed` — popula dados iniciais (admin)
- `npm run db:up` — sobe o Postgres (Docker)
- `npm run db:down` — derruba os containers locais

## Como contribuir

1. Crie a branch a partir de `develop` seguindo Git Flow: `feature/<id>-descricao`.
2. Use Conventional Commits (`feat:`, `fix:`, `docs:` …).
3. Garanta `make lint`, `make test-ci` e `make build` verdes antes do PR.
4. Cobertura mínima: **85%** (DP08).
5. Abra PR para `develop`.

