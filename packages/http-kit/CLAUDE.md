# @repo/http-kit

Shared HTTP framework package providing decorators, middleware, error handling, validation, response utilities, logging, i18n, and OpenAPI generation. This is the backbone of the API's decorator-driven architecture.

## Package Exports

All public APIs are re-exported from `src/index.ts`. Always import from `@repo/http-kit`, not from deep paths.

## Decorators

### Controller & Routes

```typescript
@Controller("/prefix", ["OpenApiTag"])  // Implicitly applies @injectable()
class MyController {
  @Get("/", { summary: "...", description: "..." })
  @Post("/", { summary: "..." })
  @Put("/:id", { summary: "..." })
  @Patch("/:id", { summary: "..." })
  @Delete("/:id", { summary: "..." })
}
```

### Parameters

```typescript
@Body()   body: DtoType<typeof BodyDto>       // req.body (validated)
@Query()  query: DtoType<typeof QueryDto>      // req.query (validated)
@Params() params: DtoType<typeof ParamsDto>    // req.params (validated)
@Headers() headers: ...                        // req.headers
@Req()    req: Request                         // raw Express request
@Res()    res: Response                        // raw Express response
```

### Validation

```typescript
@Validate({ body: BodyDto, query: QueryDto, params: ParamsDto, headers: HeadersDto })
```

Pass DTO classes (extending `BaseDto`), not raw Zod schemas. Validation middleware runs `safeParse` on each field and throws `ValidationException` with flat `{ field: "message" }` errors.

### Response Decorators

```typescript
@OkResponse(ResponseDto, "description")           // 200
@PaginatedOkResponse(ResponseDto, "description")   // 200 with pagination
@CreatedResponse(ResponseDto, "description")        // 201
@NoContentResponse("description")                   // 204
@NotFoundResponse("description")                    // 404
```

These are metadata-only — they drive OpenAPI spec generation, not runtime behavior.

## DTOs

### BaseDto

```typescript
import { BaseDto, z } from "@repo/http-kit";

export class MyDto extends BaseDto {
  static override readonly schema = z.object({ ... });
}
```

- `MyDto.parse(data)` — validates and returns typed output (throws on failure)
- `MyDto.safeParse(data)` — returns `{ success, data?, error? }`
- `DtoType<typeof MyDto>` — extracts the output type from the schema

### Pagination & Sorting Schema

Lists are page-based: `?page=1&perPage=20&sortBy=name&sortOrder=asc`.

```typescript
import { basePaginationShape, SortShapeHelper } from "@repo/http-kit";

// Spread the shapes so the result stays a flat ZodObject: zod-to-openapi cannot
// enumerate query parameters from a ZodIntersection (`.and()`) or a refined schema.
const schema = z.object({
  ...basePaginationShape, // page (default 1), perPage (default 20, max 100)
  ...SortShapeHelper.of(["name", "createdAt"] as const, "createdAt"), // sortBy, sortOrder
  search: z.string().min(1).max(128).optional(),
});
```

Map `sortBy` to columns through an explicit whitelist object in the repository,
never by interpolating the string into SQL.

## Errors

All extend `HttpException(statusCode, message, errors?)`:

| Class                    | Status |
| ------------------------ | ------ |
| `BadRequestException`   | 400    |
| `UnauthorizedException` | 401    |
| `ForbiddenException`    | 403    |
| `NotFoundException`     | 404    |
| `ConflictException`     | 409    |
| `ValidationException`   | 422    |
| `InternalServerException` | 500  |

Usage: `throw new NotFoundException(tk("resource.notFound"))`

The `ErrorHandler` middleware catches these, translates the message via i18n, and sends a structured JSON response.

## Response Utilities

```typescript
ApiResponse.ok(data, tk("response.success"))       // 200
ApiResponse.created(data, tk("resource.created"))   // 201
ApiResponse.noContent(tk("resource.deleted"))       // 204

new PaginatedResponse(dataArray, pagination, tk("response.success"))  // 200 with pagination
```

### Pagination Helpers

```typescript
const offset = PaginationHelper.offset(page, perPage);
const pagination = PaginationHelper.build({ page, perPage, total }); // { page, perPage, total, totalPages }
```

## AppFactory

```typescript
const app = AppFactory.create({
  title: "My API",
  version: "1.0.0",
  production: false,
  controllers: [ControllerA, ControllerB],
});
```

Sets up the full Express middleware stack: JSON parsing, request logging, controller loading, error handling, OpenAPI generation, and Scalar docs UI.

## Logger

`LoggerService` — pino wrapper, `@singleton()`.

```typescript
logger.init({ level: "debug", transport: { target: "pino-pretty" } });
logger.info("message");
logger.error("message");
logger.child({ requestId: "..." });
```

Built-in redaction for 40+ sensitive field patterns (passwords, tokens, secrets, etc.).

`RequestLogger` — pino-http middleware. Auto-skips `/health-check`, `/docs`, `/openapi.json`.

## i18n

`I18nService` — i18next wrapper, `@singleton()`.

```typescript
await i18nService.init({ resources: { en: { translation: ... } } });
i18nService.t("key");  // translate
```

## Zod Re-export

Import `z` from `@repo/http-kit` — it's the standard Zod re-exported with OpenAPI schema registration support.

A recursive `z.lazy` schema must be named, or spec generation overflows the stack and `/openapi.json` returns 500: `OpenApiRefHelper.name(schema, "Name")`. Use the helper rather than `.openapi("Name")` for schemas from `@repo/shared`; zod v4 attaches `.openapi` only to schemas created after this package loads.
