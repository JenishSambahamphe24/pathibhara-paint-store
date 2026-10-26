# api

Express REST API for `admin-fe` (and later `user-fe`). Default port `4002`.

## Entry Point Flow

1. `src/index.ts`: imports `reflect-metadata`, parses env with Zod, calls `Bootstrap.init()`
2. `src/bootstrap.ts`: initializes the logger, i18n and database, then `AppFactory.create()` with controllers
3. `AppFactory` (`@repo/http-kit`) sets up the Express middleware stack, loads controllers, and registers OpenAPI routes

## Route Groups

- `/admin/*`: admin panel. Every controller mounts `@UseMiddleware(requireAdmin())` at class level, except the login/refresh routes.
- `/public/*`: reserved for `user-fe`. No auth.
- `/health-check`, `/docs` (Scalar), `/openapi.json`.

There is a single admin role, so there is no permission middleware. Do not add one without asking.

## Path Aliases

Defined in `package.json` `imports` (not tsconfig paths):

```typescript
import { ConfigService } from "#config";
import { tk } from "#i18n/tk";
import { AuthController } from "#modules/auth/auth.controller";
```

## Config

- `src/config/env.schema.ts`: Zod schema of expected env vars
- `src/config/env.holder.ts`: `EnvHolder.init(env)` singleton holding the parsed env
- `src/config/config.service.ts`: `@singleton()` with typed getter groups (`config.app`, `config.database`, `config.authJwt`, ...)

## Controller Pattern

```typescript
@Controller("/admin/products", ["Products"])
@UseMiddleware(requireAdmin())
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get("/", { summary: "List products" })
  @PaginatedOkResponse(ProductResponseDto, "Product list")
  @Validate({ query: ListProductsRequestDto })
  async list(@Query() query: DtoType<typeof ListProductsRequestDto>) {
    const { items, pagination } = await this.productService.list(query);
    return new PaginatedResponse(items, pagination);
  }

  @Post("/", { summary: "Create product" })
  @CreatedResponse(ProductResponseDto, "Product created")
  @Validate({ body: CreateProductRequestDto })
  async create(@Body() body: DtoType<typeof CreateProductRequestDto>, @Req() req: Request) {
    const product = await this.productService.create(
      body,
      (req as AuthenticatedRequest).auth.adminId,
    );
    return ApiResponse.created(product, tk("product.created"));
  }
}
```

- Always pair `@Validate` with the corresponding param decorator.
- Return `ApiResponse.*` or `PaginatedResponse`, never raw objects.
- `created_by` columns take `auth.adminId` from the request.

## Service Pattern

- `@injectable()` (transient, not `@singleton`).
- Parse output through response DTOs before returning.
- Throw typed exceptions with `tk()` keys: `throw new NotFoundException(tk("product.notFound"))`.
- Multi-step writes go inside `txManager.run(async () => { ... })`. Repositories join the transaction automatically through AsyncLocalStorage, so never pass `tx` around.

## Repository Pattern

```typescript
@injectable()
export class ProductRepository {
  constructor(private readonly txManager: TransactionManager) {}

  private get db() {
    return this.txManager.current();
  }
}
```

- Return raw Drizzle rows.
- Lists are page-based: `limit(perPage).offset(PaginationHelper.offset(page, perPage))` plus a `count(*)` with the same `where`.
- `sortBy` goes through a whitelist object of columns; never interpolate it.
- Aggregations are SQL (`sql\`...\`` CTEs), never rows summed in Node.

## DTO Pattern

When `@repo/shared` already has a schema for the payload, the DTO wraps it, so frontend and backend validate the same thing:

```typescript
import { BaseDto } from "@repo/http-kit";
import { createProductSchema } from "@repo/shared";

export class CreateProductRequestDto extends BaseDto {
  static override readonly schema = createProductSchema;
}
```

Response DTOs and API-only query DTOs use `z` from `@repo/http-kit`. All of a module's DTO classes live in one `<module>.dto.ts`; split into a `dto/` folder only when that file gets unwieldy.

Money is integer paisa (`paisaSchema` from `@repo/shared`) and stays a number end to end. Sums happen in SQL; `bigint` results come back as numbers via the `DatabaseService` int8 parser.

## i18n

- Translation file: `src/i18n/en/translation.json`
- Type-safe key helper: `src/i18n/tk.ts`
- Add a top-level namespace per module.

## Database

- `pnpm db:generate --name=<snake_case>` after editing `packages/database/src/schema/*`
- `pnpm db:migrate`, `pnpm db:seed`, `pnpm db:reset`, `pnpm admin:create <email> <password> [name]`

## Tests

Vitest, with `*.test.ts` next to the code. Services are tested with hand-written fakes passed to the constructor (see `auth.service.test.ts`). Stock-ledger rules also get integration tests against `TEST_DATABASE_URL`.
