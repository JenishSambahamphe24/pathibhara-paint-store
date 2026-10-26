# Conventions

This file describes how this repo is built. It is taken from the **bitsky-monorepo**
reference project (`~/Desktop/Codexx/Bitsky-monorepo`). We copy its conventions and
architecture only, not its business logic, secrets or env values. Where we
deviate from bitsky, the item is marked **Deviation** and gives the reason.

Where bitsky's own docs and its code disagree, this file follows the code:

- `stack.md` lists Nivo, but no chart library is installed. Charts are
  hand-written SVG.
- The editor saves HTML, not JSON.
- Repositories use `TransactionManager`, not `DatabaseService`.

---

## 1. Workspace and tooling

| Item | Convention |
|---|---|
| Package manager | pnpm 10 workspaces (`apps/*`, `packages/*`), with `packageManager` pinned in the root `package.json`. Node >= 22. |
| Orchestration | Turborepo: `build`, `test` and `typecheck` depend on `^build`; `dev` is persistent and not cached. |
| Versions | **pnpm catalogs** in `pnpm-workspace.yaml` (`generic`, `fe`, `be`). A `package.json` never contains a literal version; it uses `"catalog:<name>"`. |
| Package deps | `packages/*` declare runtime deps as `peerDependencies` (and repeat them in `devDependencies`). `apps/*` own their full dependency tree. |
| Package build | Internal packages are source-only: `"exports": { ".": "./src/index.ts" }`, `"build": "tsc --noEmit"`. |
| Package scope | `@repo/*`. |
| Root | Holds only workspace config, CI and tooling. No app code. One lockfile, at the root. |
| Root scripts | `dev`, `build`, `test`, `lint`, `format`, `typecheck` run through turbo. `db:*` scripts forward to the API with `pnpm --filter`. |
| Git hooks | husky. `commit-msg` runs commitlint (conventional commits). `pre-push` runs `turbo run lint format`. |
| Lint / format | Presets live in `packages/config` (`@repo/config/{eslint,prettier,tsconfig}/*`). Prettier: double quotes, semicolons, trailing commas, `@ianvs/prettier-plugin-sort-imports`, plus `prettier-plugin-tailwindcss` on the frontend. |
| TypeScript | `strict`, `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`. The backend also enables `experimentalDecorators` and `emitDecoratorMetadata` for tsyringe. |
| Path aliases | Defined in the `package.json` `"imports"` field. Frontend: `#/*` → `src/*`. Backend: `#config`, `#helpers/*`, `#i18n/*`, `#modules/*`. |
| Per-app docs | Each app has a `CLAUDE.md` whose rules are blocking. |

## 2. Rules for every workspace

- **Props are a named `interface <Component>Props`**, never an inline object type.
- **Helpers and utilities are classes with static methods**, never standalone
  exported functions. A file `slug.helper.ts` holds the class `SlugHelper`.
- **Comments only explain *why*.** Don't write doc blocks that restate a
  declaration, and don't leave commented-out code or `console.log` behind.
- **Named exports only**, never default exports. Components and hooks are
  function declarations, not arrow-function consts.
- **One exported component, hook or class per file.** Small private helpers
  (a row sub-component, a skeleton) may sit next to the export that uses them.
  **Deviation:** bitsky forces even those into their own files.
- **Interfaces start with `I`** (`IProduct`); **type aliases start with `T`** (`TStockMovementType`).
- **Enums are `as const` arrays in `@repo/shared`** with a derived type, and the
  DB `pgEnum` is built from the same array, so there is one source of truth
  (**Deviation:** bitsky copies them by hand because its database package
  doesn't depend on shared):
  ```ts
  export const STOCK_MOVEMENT_TYPES = ["batchIn", "batchVoid", "sale", "saleEdit", "adjustment"] as const;
  export type StockMovementType = (typeof STOCK_MOVEMENT_TYPES)[number];
  // packages/database: pgEnum("stock_movement_type", STOCK_MOVEMENT_TYPES)
  ```

## 3. Backend (`apps/api`)

**Stack:** Express 4, tsyringe DI, and decorator controllers from
`@repo/http-kit`. Drizzle ORM with `pg`, pino logging, zod v4, OpenAPI 3.1 docs
via zod-to-openapi with a Scalar UI at `/docs`. Dev runs through
`@swc-node/register` with watch mode; the production build uses tsup.

### Layers

`modules/<name>/` contains:

- `<name>.controller.ts`
- `<name>.service.ts`
- `<name>.repository.ts`
- `<name>.dto.ts`, holding all of the module's DTO classes. A module with many
  DTOs may split them into a `dto/` folder. **Deviation:** bitsky uses one file
  per DTO, which for a CRUD module means four or five near-empty files.

**Controller.** A `@Controller(prefix, tags)` class with `@Get/@Post/...`
methods. Each method pairs `@Validate({ body | query | params })` with the
matching `@Body()/@Query()/@Params()` decorator. Parameters are typed as
`DtoType<typeof X>`. Handlers return `ApiResponse.ok/created/noContent(...)`
or `new PaginatedResponse(...)`, never a raw object.

**Service.** `@injectable()` (transient). Output goes through
`ResponseDto.parse(...)`. Errors are typed exceptions with an i18n key, for
example `throw new NotFoundException(tk("product.notFound"))`.

**Repository.** `@injectable()`. It injects `TransactionManager` and exposes
`private get db() { return this.txManager.current(); }`. It returns raw Drizzle
rows. Joins are written by hand; Drizzle `relations()` are not used.

**DTOs.** DTO classes `extends BaseDto` with
`static override readonly schema = z.object(...)`, where `z` is imported from
`@repo/http-kit` (zod with OpenAPI extensions). Query DTOs are flat
`z.object`s; spread shapes into them rather than using `.and()`, or OpenAPI
query parameters break.

### Response and error shapes

| Case | Shape |
|---|---|
| Success | `{ message, data }` |
| Paginated | `{ message, data: [], pagination }` |
| Error | `{ message }` |
| Validation error (422) | `{ message, errors: { "field.path": "msg" } }` |
| Unique violation (`23505`) | Mapped to 409 by the global `ErrorHandler`. |

Messages are i18n keys that are translated at response time. Keys live in
`src/i18n/en/translation.json` and are typed through `tk()`.

### Transactions

Use `txManager.run(async () => { ... })`. It stores the transaction in
AsyncLocalStorage, so every repository joins it automatically, and a nested
`run` joins the outer one. Use `txManager.afterCommit(hook)` for side effects.
Stock operations follow bitsky's wallet-ledger pattern:

1. `SELECT ... FOR UPDATE` on the `product_variants` rows involved (always in
   variant-id order, to avoid deadlocks).
2. Validate (no negative stock) and throw `ConflictException` if it fails.
3. Insert the `stock_movements` ledger row(s).
4. Update the cached `current_stock` with SQL arithmetic
   (`sql\`${col} + ${qty}\``), never with read-modify-write in JS.

Steps 1–4 all run in one transaction.

### Auth

Copied from bitsky's admin auth, minus 2FA for now:

- **Passwords:** bcrypt, with the cost set by `BCRYPT_COST`.
- **Tokens:** JWT access and refresh tokens (jsonwebtoken), signed with
  separate secrets. Access lives 900s by default and refresh 7 days.
- **Transport:** the client sends `Authorization: Bearer`.
- **Refresh tokens:** stored as a SHA-256 hash in `sessions` and rotated on
  every refresh. Logout revokes the session.
- **Endpoints:** `POST /auth/login | /auth/refresh | /auth/logout`, plus
  `GET /admins/me`.
- **Guards:** `@UseMiddleware(requireAdmin())` on the controller class. There
  is a single admin role, so bitsky's `roles` table, permission registry and
  `requirePermission` are not ported.
- **Seeding the first admin:** `admin:create <email> <password>` script, plus a
  `SUPER_ADMIN_*` env seed.

### Env

- `src/config/env.schema.ts` is a zod schema.
- `index.ts` parses `process.env` and stores it with `EnvHolder.init(env)`.
- An `@singleton() ConfigService` exposes typed getter groups (`config.app`,
  `config.database`, `config.authJwt`, ...).
- `.env.example` is committed; `.env` is git-ignored.

### Uploads

- Multipart uploads go to the API through a busboy `MultipartMiddleware`. It
  enforces size, count and a MIME allow-list, and sniffs magic bytes.
- `FileService.upload` stores the object, computes a blurhash and dimensions
  (sharp), and inserts a `files` row.
- Storage goes through a `BaseStorageService` abstraction: local disk in dev
  (served with `express.static`), S3-compatible in prod. No presigned uploads.
- Images are always returned as the full `FileResponseDto`
  (`{ id, url, blurHash, width, height, mimeType, ... }`), never as a bare URL.

### Analytics

Aggregations are raw `this.db.execute(sql\`WITH ... SELECT ...\`)` CTEs that
interpolate Drizzle table objects. Day buckets use
`date_trunc('day', col AT TIME ZONE ...)` and `generate_series` to fill gaps.
Supporting indexes are added in migrations. Rows are never loaded into Node to
be summed.

## 4. Database (`packages/database`)

| Item | Convention |
|---|---|
| Schema files | `src/schema/<kebab-name>.schema.ts`, one table per file, all re-exported from `schema/index.ts`. |
| Naming | Tables are plural snake_case (`product_variants`). TS fields are camelCase mapped to snake_case columns. |
| Primary key | `uuid("id").primaryKey().default(sql\`uuid_generate_v7()\`)`. The function is created in custom migration `0000`. v7 ids are time-sortable, so they also work as a stable tiebreaker for sorting. |
| Timestamps | `createdAt` and `updatedAt` (`$onUpdate`) as `timestamptz`. |
| Retiring rows | **No `deleted_at` soft delete** (**Deviation** from bitsky). Records retire through their domain state: `is_active` for categories, products, variants, shades and colour sets; `voided_at` for batches; `status` for posts and admins. Ledger and history rows are never deleted. |
| Enums | `pgEnum` with camelCase values, built from the `@repo/shared` array. |
| Indexes | Declared in the third argument of `pgTable`. |
| Foreign keys | `.references(() => t.id, { onDelete: "restrict" })`. Ledger and history rows use `restrict`. |
| Money | **Integer paisa** in `bigint(..., { mode: "number" })` columns named `*_paisa`, numbers end to end (`paisaSchema` = `z.number().int()`). **Deviation:** bitsky's `numeric` strings exist for balances past 2^53, which a store never reaches, and integers are exact without `decimal.js`. node-postgres returns int8 as strings, so `DatabaseService` installs a parser that converts them and throws if a value isn't a safe integer. Rupee text from forms goes through `MoneyHelper.parseRupees` (no float). |
| Volume | Integer millilitres (`integer("volume_ml")`). bitsky has no precedent. |
| Migrations | drizzle-kit, run through `scripts/dk.mjs`. Generate with `pnpm db:generate --name=snake_case`; the migrations are committed under `packages/database/drizzle/`. `migrate.ts` uses a `pg.Pool` with `-c timezone=UTC`. `reset.ts` drops and recreates the schema. |
| `DatabaseService` | `@singleton` that owns the pool. bitsky's read-replica, LISTEN/NOTIFY and advisory-lock parts are dropped (**Deviation:** single-node app). |
| Seeds | Static seed classes. `db:seed` (admin + store settings) is idempotent and safe everywhere. `db:seed:sample` loads clearly labelled sample data (`SMP-` SKUs, "Sample data" notes), refuses in production, and skips a non-empty catalogue. |

## 5. Shared (`packages/shared`)

Pure TypeScript with zod as a peer dependency. It holds `as const` enums,
constants and limits, pure helper classes, and the cost calculator.

**Deviation:** bitsky keeps request schemas only in backend DTOs, and its
frontend writes its own interfaces. The brief requires schemas shared between
frontend and backend, so:

- **Request schemas are plain zod objects in `@repo/shared`**, exported as
  consts with their inferred type (`adminLoginSchema` / `AdminLoginInput`),
  the same way bitsky's shared package exports its few schemas.
- **Backend DTOs wrap them:** `static override readonly schema = adminLoginSchema`.
  Both sides import the same zod instance through the catalog peer dependency,
  so `.openapi()` still works.
- **Frontend forms** use the same schema as their TanStack Form validator.
- **Messages:** validation messages in shared schemas are plain English strings,
  since the app is English only. The API returns them in `errors`, and the
  form shows them under the field.

## 6. admin-fe (`apps/admin-fe`)

**Stack:**

- TanStack Start on Nitro, **with SSR off** (`src/start.ts`: `defaultSsr: false`;
  SPA mode in `vite.config.ts` also prerenders `_shell.html` for static
  hosting). React 19 with the React Compiler, Vite. **Deviation:** bitsky
  server-renders its admin. Ours is behind a login and never indexed, so SSR
  only added cost. The server renders the `<html>` shell; `AppLayout` is the
  root route's `component` and mounts client-side. The admin also sends
  `noindex` and a disallow-all `robots.txt`.
- File-based routing with TanStack Router.
- TanStack Query v5, Form v1, Table v8, Store and Pacer.
- Ark UI primitives, Tailwind v4, lucide-react icons.
- Paraglide i18n, dayjs, Vitest.

### Folder layout

```
src/
  components/<Name>/<Name>.tsx  # shared, domain-free (DataTable, FormInput, ConfirmDialog, ...)
  features/<featureName>/       # camelCase as in bitsky's code (its docs say PascalCase); components/, hooks/, api.ts, types.ts
  hooks/                        # shared hooks
  integrations/tanstackQuery/   # QueryClient provider
  layouts/AppLayout.tsx         # sidebar + navbar shell
  lib/                          # api.ts (ApiClient), config.ts, env.ts, form.ts, toaster.ts
    helpers/                    # *.helper.ts static classes
  routes/                       # __root.tsx, (auth)/, (core)/, routeTree.gen.ts (generated)
  styles/                       # global.css, tailwind.css (theme tokens)
  paraglide/                    # generated, never edit
```

- Within a feature, imports are relative. Use `#/features/...` only to cross
  feature boundaries.
- **Route files are thin.** `createFileRoute(...)({ component })` renders a
  `<Feature>Page` from `features/`.
- **HTTP:** a static `ApiClient` (a fetch wrapper) adds the Bearer token
  through an injected `getAuthToken` hook. On a 401 it calls `onUnauthorized`
  (which refreshes the token) and retries once. Failures throw an `ApiError`
  that carries the `{ message, errors }` body.
- **Per-feature API classes:** `features/<x>/api.ts` has static methods that
  unwrap `response.data`.
- **Queries and mutations:**
  - Queries live in `hooks/useXxx.ts` as `useQuery(queryOptions(...))`. The
    query key starts with an exported constant (`PRODUCT_LIST_QUERY_KEY`).
  - Mutations live in `hooks/useXxxActions.ts`. They toast on success and
    error (`ApiErrorHelper.describe`) and invalidate on settle.
- **Auth:**
  - Tokens are stored in cookies through the isomorphic cookie helpers kept
    from bitsky (their server branch is unused now that SSR is off).
  - The root `beforeLoad` runs `authGuard.apply`: no token means redirect to
    `/login`; otherwise it calls `/admin/auth/me`, cached per token for 30s.
  - Auth state lives in a TanStack `Store`.
  - Concurrent token refreshes share one in-flight request.
- **Layout:**
  - `AppLayout` renders a bare `<Outlet/>` for `(auth)` routes.
  - Other routes get the sidebar, navbar and container.
  - Sidebar items are declared as `ISidebarGroup[]` in `useSidebarItems`.
  - Breadcrumbs are set explicitly on each page.
- **Forms:**
  - `createFormHook` sets up `useAppForm` with field components (`FormInput`,
    `FormSelect`, `FormTextarea`, `FormRichText`, ...).
  - Each form has a hook, `useXxxForm`, that owns the schema, the mutation and
    the form.
  - Validation runs `onSubmit`, then `onChange` once the user has tried to submit once.
  - `FormHelper.handleSubmitError` maps the API's `errors` onto fields.
  - Leaving a dirty form triggers `useUnsavedChanges`.
- **Tables:**
  - `DataTable` = TanStack Table + `Pagination`, and supports both page-based
    and cursor pagination.
  - Columns come from a hook, `useXxxColumns`.
  - `SearchInput` is debounced 300ms with `@tanstack/react-pacer`.
  - Filters are `FilterSelect` / `DateRangeFilter`.
  - **Deviation:** bitsky keeps most list state in `useState`. We keep search,
    filters, sort and page in the URL (`validateSearch` with zod), so lists are
    linkable and survive a refresh. Bitsky already does this on two routes.
- **Destructive actions:** they always go through `ConfirmDialog`.
- **Styling:**
  - Use only semantic tokens from `styles/tailwind.css` (`bg-surface`,
    `text-foreground-muted`, `border-border`, `success/danger/...`).
  - No raw palette colours, no arbitrary values (`w-[..]`), no inline
    `style`. A missing token is added to the theme, never patched with a raw
    value.
  - **Exception for the 3D visualizer:** the shade swatches and the canvas have
    to render arbitrary admin-chosen hex values. That is done with a single
    `style={{ backgroundColor }}` on a swatch component, or through Three.js
    materials.
- **Text and numbers:**
  - All visible text goes through Paraglide `m.*()`.
  - Money (integer paisa) and quantities are formatted with a helper
    (`CurrencyHelper.formatNpr`, `VolumeHelper.format`), never shown raw.
- **Env:** `lib/config.ts` (`Config` class) reads the `VITE_*` vars.
  **Deviation:** we validate them through `@t3-oss/env-core`. bitsky has that
  file but never wires it up.
- **Fix, not copy:** bitsky creates one module-level `QueryClient`, which is
  shared across SSR requests. We create one in `getRouter()`.
- **Refresh hooks:** auth routes live under `/admin/auth/*` here, so `ApiClient`
  skips its refresh hooks only for `login` and `refresh`. `/me` and `/logout`
  still get token refresh.
- **Time:** `DateHelper` renders instants in the store's zone
  (`Asia/Kathmandu`), not bitsky's US Central. Money goes through
  `CurrencyHelper.formatNpr` (en-IN lakh grouping).

## 7. Testing

- Vitest, with tests next to the code as `*.test.ts`. Workspaces use the
  default config.
- Pure logic (the calculator, helpers) gets plain unit tests.
- Services are unit-tested with hand-written fake repositories passed to the
  constructor, as bitsky does.
- **Deviation:** bitsky has no tests that run against a database.
  The stock ledger rules (no negative stock, void reversal, sale edits,
  `current_stock == SUM(movements)`) can only be trusted against real Postgres
  row locks, so we add integration tests that run against a `TEST_DATABASE_URL`.

## 8. Not copied from bitsky

- Redis/Valkey, BullMQ, socket.io, RabbitMQ.
- Read replicas.
- The CRM, email, payments and AI services.
- graphify.
- Release scripts, ECS task definitions and the deploy workflow.
- Player PII masking.
- 2FA (can be added later using the same pattern).
- `@repo/services`, of which only the storage abstraction is ported, into the API.

## 9. Product decisions

- **No VAT.** Prices are entered and shown as final prices, with no tax fields.
- **The calculator applies wastage.** A wastage percentage increases the litres
  needed *before* rounding up to container sizes. It is an input on each
  estimate, and its default comes from a store setting.
- **One category per product.** `products.category_id` is a single non-null
  foreign key, with no join table.
- **Only one admin role.** The `admins` table has no roles. `created_by`
  columns still reference `admins.id`.

## 10. Technical decisions (approved at Checkpoint 0)

1. One `apps/api`, with `/admin` and `/public` route groups.
2. ~~Money is `numeric(12,2)` strings~~, replaced after Checkpoint 1 by
   integer paisa (see section 12).
3. Lists use page-based pagination with sorting by any column
   (`page`, `perPage`, `sortBy`, `sortOrder`; see `@repo/http-kit` `SortShapeHelper`).
4. Blog: TipTap with `@tiptap/extension-image`, stored as JSON. On the server,
   `@tiptap/html` renders it to HTML and `sanitize-html` cleans it. These are
   added in Phase 4.
5. Charts: Recharts, added in Phase 4.
6. Images: bitsky's storage abstraction, local disk in dev and S3-compatible in
   prod. Ported in Phase 3 together with the multipart middleware.
7. `docker-compose.yml` runs Postgres only, and the ledger has integration tests
   against `TEST_DATABASE_URL`.
8. English only for now (Paraglide is ready for more locales).
9. No 2FA in v1.
10. The repo is a git repository.
- **Wastage default:** 10%.

## 11. Dependency versions

`pnpm-lock.yaml` was seeded from bitsky's lockfile, so every dependency we
share with bitsky resolves to the exact version bitsky runs. A fresh resolve
picked up TanStack Start 1.169, whose build fails with this setup (the client
build looks for an `index.html` entry). Bump TanStack Start/Router versions
deliberately, and test `pnpm --filter admin-fe build` when you do.

## 12. Simplifications approved after Checkpoint 1

These trim bitsky conventions that exist for bitsky's scale, not ours:

1. No `deleted_at` soft delete; domain states instead (section 4).
2. `pgEnum`s are built from the `@repo/shared` arrays (section 2).
3. Money is integer paisa (section 4).
4. One DTO file per module (section 3).
5. admin-fe renders client-side only (section 6).
6. One *exported* component per file (section 2).

Kept on purpose: Paraglide in both frontends (Nepali is coming), and the
API's i18n'd error messages (`tk()`).

## 13. SEO (customer site)

The customer site (`user-fe`) must be SEO optimised, in English and later
Nepali. It keeps SSR. Planned, and partly shaped in the Phase 2 schema:

- **Locale in the URL:** `/` (English) and `/ne/...` (Nepali) via Paraglide's
  URL strategy, with `hreflang` alternates and `x-default` on every page.
- **Stable, readable URLs:** category, product and blog slugs are unique and
  stay English for both locales. A changed slug must leave a 301 from the old
  one (a `slug_redirects` table).
- **Per-page metadata:** an optional SEO title and description on categories,
  products and posts, falling back to name/excerpt. Canonical URLs, Open Graph
  and Twitter tags. The cover image is the OG image.
- **Structured data:** JSON-LD `Product` (with an `AggregateOffer` over variant
  prices and availability from stock), `BreadcrumbList` and `BlogPosting`.
- **`sitemap.xml`** (per locale, with `lastmod` from `updated_at`) and
  `robots.txt` served by user-fe; the API exposes `/public/*` read endpoints
  that return only active and published content.
- **Images:** the `files` table stores width, height and alt text, so pages can
  avoid layout shift and describe images.
- **Translated content (decided after Checkpoint 1):** each translatable table
  has a `*_translations` table keyed `(entity_id, locale)` holding name,
  description and SEO fields. English is required; Nepali is optional and
  falls back to English. A third language is a new `LOCALES` value plus a
  migration for the `locale` enum, with no table changes. See `docs/schema.md`.

---

## Repo layout

```
pathibhara-paints/
├── apps/
│   ├── api/                 # Express API (brief: "backend"); /admin/* routes now, /public/* later for user-fe
│   │   ├── src/{config,helpers,i18n,modules,db}/
│   │   ├── scripts/         # seed.ts, create-admin.ts
│   │   └── CLAUDE.md
│   ├── admin-fe/            # TanStack Start admin panel, client-rendered (port 4005)
│   └── user-fe/             # TanStack Start, SSR for SEO; scaffold only (port 4006)
├── packages/
│   ├── config/              # @repo/config: eslint / prettier / tsconfig presets
│   ├── http-kit/            # @repo/http-kit: decorators, BaseDto, ApiResponse, errors, OpenAPI, logger, i18n
│   ├── database/            # @repo/database: Drizzle schema, migrations, DatabaseService, TransactionManager
│   ├── shared/              # @repo/shared: enums, zod request schemas, helpers, cost calculator (+ tests)
│   └── visualizer/          # @repo/visualizer: R3F house preview (Phase 5)
├── docker-compose.yml       # Postgres only (bitsky has none)
├── pnpm-workspace.yaml      # workspaces + catalogs
├── turbo.json
├── tsconfig.base.json
├── commitlint.config.js
├── .husky/
├── CLAUDE.md                # repo-wide rules (sections 1–2 above)
├── CONVENTIONS.md
└── README.md
```

**Deviation:** bitsky splits `admin-api` and `user-api` into separate apps. For
a single store, one `apps/api` with `/admin` and `/public` route groups is
enough, and it avoids duplicating auth, storage and env setup. It can be split
later along the same module boundaries.
