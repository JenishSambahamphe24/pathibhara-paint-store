# Pathibhara Paints

Store platform for a paint and waterproofing shop. It has an admin dashboard (catalogue, stock, sales, cost calculator, blog, colour visualizer), a customer site, and an API.

| App / package | What it is | Port |
|---|---|---|
| `apps/api` | Express + Drizzle REST API | 4002 |
| `apps/admin-fe` | Admin panel (TanStack Start) | 4005 |
| `apps/user-fe` | Customer site (scaffold only) | 4006 |
| `packages/shared` | Shared enums, zod schemas, business logic | – |
| `packages/database` | Drizzle schema + migrations | – |
| `packages/http-kit` | API framework (decorators, DTOs, errors, OpenAPI) | – |
| `packages/config` | eslint / prettier / tsconfig presets | – |

## Prerequisites

- Node >= 22 and pnpm 10 (`corepack enable`)
- PostgreSQL 15+. Either run the bundled container (`docker compose up -d`, which also creates the `pathibhara_paints_test` database) or use a local install.

## Setup

```bash
pnpm install

cp apps/api/.env.example apps/api/.env
cp apps/admin-fe/.env.example apps/admin-fe/.env
# Edit apps/api/.env: DATABASE_URL, the two JWT secrets
# (openssl rand -base64 48), and SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD.

pnpm db:migrate
pnpm db:seed          # creates the admin from SUPER_ADMIN_* (idempotent)
pnpm db:seed:sample   # optional: sample catalogue and stock to click around with

pnpm dev              # api + admin-fe + user-fe
```

Then open http://localhost:4005 and sign in. The API docs are at http://localhost:4002/docs.

## Environment variables

**`apps/api/.env`**

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | Postgres connection string |
| `TEST_DATABASE_URL` | for tests | Separate, disposable database used by integration tests |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | yes | ≥ 32 characters each, different from each other |
| `JWT_ACCESS_TTL_SECONDS`, `JWT_REFRESH_TTL_SECONDS` | no | Default 900 and 604800 |
| `BCRYPT_COST` | no | Default 12 |
| `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD`, `SUPER_ADMIN_NAME` | for seeding | Admin created by `pnpm db:seed` |
| `PORT`, `NODE_ENV`, `LOG_PRETTY` | no | Default 4002, development, true |
| `CORS_ORIGINS` | yes in dev | Comma-separated frontend origins |
| `TRUST_PROXY` | in prod | Number of proxies in front of the API |
| `DOCS_PASSWORD` | no | Password-protects `/docs` and `/openapi.json` |
| `DATABASE_POOL_*` | no | Pool tuning |

**`apps/admin-fe/.env`**

| Variable | Required | Notes |
|---|---|---|
| `VITE_API_BASE_URL` | yes | e.g. `http://localhost:4002` |
| `VITE_COOKIE_DOMAIN` | no | Leave blank locally |

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Run every app in watch mode |
| `pnpm dev:api` / `pnpm dev:admin` | Run one app |
| `pnpm build` | Build everything |
| `pnpm test` | Run all tests |
| `pnpm lint` / `pnpm typecheck` / `pnpm format` | Checks |
| `pnpm db:generate --name=<snake_case>` | Generate a migration after editing `packages/database/src/schema` |
| `pnpm db:migrate` | Apply pending migrations |
| `pnpm db:seed` | Admin + store settings (idempotent, safe in every environment) |
| `pnpm db:seed:sample` | Sample catalogue, stock, sales, shades (dev only; skips a non-empty catalogue) |
| `pnpm db:reset` | **Drop everything** in the database, then run `db:migrate` + `db:seed` |
| `pnpm db:studio` | Drizzle Studio |
| `pnpm admin:create <email> <password> [name]` | Create an admin account |

## Database

See `docs/schema.md` for the ERD, the rules the schema enforces, and how the stock ledger is written.

## Conventions

Read `CONVENTIONS.md` and the root and per-app `CLAUDE.md` files before contributing. Commits follow Conventional Commits (enforced by commitlint).
