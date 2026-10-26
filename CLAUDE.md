# Pathibhara Paints: Monorepo Guidelines

Admin dashboard, customer site and API for a paint and waterproofing store. The repo is managed with **pnpm workspaces** and **Turborepo**. Its architecture follows the bitsky-monorepo reference project; see `CONVENTIONS.md` for what was copied and every deliberate deviation.

## Layout

```
apps/
  api/        # Express API (port 4002)
  admin-fe/   # admin panel, TanStack Start (port 4005)
  user-fe/    # customer site, TanStack Start (port 4006), scaffold only
packages/
  config/     # @repo/config: eslint / prettier / tsconfig presets
  http-kit/   # @repo/http-kit: decorators, DTOs, responses, errors, OpenAPI, logger, i18n
  database/   # @repo/database: Drizzle schema, migrations, DatabaseService, TransactionManager
  shared/     # @repo/shared: enums, zod request schemas, pure business logic (cost calculator)
```

## Working in this repo

- **App-specific rules** live in `apps/<app>/CLAUDE.md` and are blocking. Read the relevant one before working inside an app.
- Run app commands with `pnpm --filter <app> <script>`. Root scripts (`pnpm dev`, `build`, `test`, `lint`, `typecheck`) run through turbo.
- No Redis. Don't add it.
- Ask before adding any dependency that isn't already in a `pnpm-workspace.yaml` catalog.

## Conventions that apply repo-wide

### Props are always a named interface

A component's props are declared as `interface <Component>Props` above the component, never as an inline object type on the destructured parameter. This holds even for a one-prop component.

### Comments: only where the code can't speak for itself

The default is no comment. Don't write comments that restate what a declaration is or does. Do comment edge cases, non-obvious constraints, cross-boundary contracts, and "why this and not the obvious thing". No commented-out code, no `console.log` in a diff, and no comments indicating AI authorship.

### Utility / helper files are classes with static methods

Any helper or non-React lib file exposes its functions as static methods on one class (`slug.helper.ts` → `SlugHelper`). Never use standalone exported functions. A truly local one-liner is inlined instead.

### Packages use `peerDependencies`; versions live in catalogs

- `packages/*` declare runtime deps as `peerDependencies` (and repeat them in `devDependencies`). `apps/*` own their dependency trees.
- Every version lives in a `pnpm-workspace.yaml` catalog (`generic`, `fe`, `be`). Reference it as `"catalog:<name>"`; never write a literal version in a `package.json`.
- The lockfile was seeded from bitsky's so shared deps resolve to the same tested versions. Don't regenerate it from scratch.

### Money is integer paisa; volume is integer millilitres

- Money columns are `bigint(..., { mode: "number" })` named `*_paisa`, validated with `paisaSchema` (whole numbers). They stay integers everywhere; format only at the rendering edge (`CurrencyHelper.formatNpr`). Never divide money into floats.
- Rupee text from a form becomes paisa through `MoneyHelper.parseRupees`, never `parseFloat`.
- Volumes are integer millilitres (`volume_ml`).
- Prices are final (no VAT).

### One source of truth for enums

Enum values live as `as const` arrays in `@repo/shared`. The `pgEnum` in `packages/database` is built from that array; never retype the values.

### No soft delete

There is no `deleted_at` column. Records retire through their domain state (`is_active`, `voided_at`, `status`). Ledger and history rows are never deleted.

### SEO

`user-fe` is server-rendered and must stay SEO friendly (English now, Nepali next): locale-prefixed URLs, stable slugs with redirects, per-page metadata, JSON-LD and a sitemap. `admin-fe` is client-rendered and `noindex`. See `CONVENTIONS.md` section 13.

### Stock changes go through the ledger

Every stock change writes a `stock_movements` row and updates the cached `current_stock`, inside the same transaction, after `SELECT ... FOR UPDATE` on the affected variants (locked in id order).
