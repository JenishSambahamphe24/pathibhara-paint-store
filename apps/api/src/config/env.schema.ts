import { z } from "zod";

const booleanString = z
  .enum(["true", "false", "1", "0"])
  .transform((v) => v === "true" || v === "1");

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4002),
  LOG_PRETTY: booleanString.default(true),

  DATABASE_URL: z.string(),
  DATABASE_POOL_MAX: z.coerce.number().int().positive().default(10),
  DATABASE_POOL_IDLE_TIMEOUT_MS: z.coerce.number().int().positive().default(30_000),
  DATABASE_POOL_CONNECTION_TIMEOUT_MS: z.coerce.number().int().positive().default(5_000),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_TTL_SECONDS: z.coerce.number().int().positive().default(900),
  JWT_REFRESH_TTL_SECONDS: z.coerce.number().int().positive().default(604800),

  BCRYPT_COST: z.coerce.number().int().min(4).max(15).default(12),

  // When all three are set, `pnpm db:seed` creates this admin if missing.
  SUPER_ADMIN_EMAIL: z.email().toLowerCase().optional(),
  SUPER_ADMIN_PASSWORD: z.string().min(8).optional(),
  SUPER_ADMIN_NAME: z.string().min(1).default("Store Owner"),

  // Comma-separated origins, or `*` to echo any origin (dev only).
  CORS_ORIGINS: z.string().optional(),

  // Number of proxies in front of the API. Never "true": that trusts the
  // caller's own X-Forwarded-For header.
  TRUST_PROXY: z.coerce.number().int().min(0).optional(),

  // Only the local disk provider exists so far; an S3-compatible provider is
  // added for production behind the same StorageService interface.
  STORAGE_PROVIDER: z.enum(["local"]).default("local"),
  STORAGE_LOCAL_ROOT: z.string().default("./uploads"),
  // Public URL prefix files are served from (the API mounts it for local).
  STORAGE_PUBLIC_BASE_URL: z.url().default("http://localhost:4002/uploads"),
  UPLOAD_MAX_IMAGE_BYTES: z.coerce
    .number()
    .int()
    .positive()
    .default(5 * 1024 * 1024),

  // When set, /docs and /openapi.json sit behind a password login page.
  DOCS_PASSWORD: z.string().min(1).optional(),
});
