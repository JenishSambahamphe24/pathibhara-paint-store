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

  // When set, /docs and /openapi.json sit behind a password login page.
  DOCS_PASSWORD: z.string().min(1).optional(),
});
