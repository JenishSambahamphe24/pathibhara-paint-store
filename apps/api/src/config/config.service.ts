import { singleton } from "tsyringe";

import { EnvHolder } from "./env.holder";

interface AppConfig {
  env: string;
  port: number;
  logPretty: boolean;
  production: boolean;
}

interface DatabaseConfig {
  url: string;
  poolMax: number;
  idleTimeoutMs: number;
  connectionTimeoutMs: number;
}

interface AuthJwtConfig {
  accessSecret: string;
  refreshSecret: string;
  accessTtlSeconds: number;
  refreshTtlSeconds: number;
}

interface AuthPasswordConfig {
  bcryptCost: number;
}

@singleton()
export class ConfigService {
  get app(): AppConfig {
    const env = EnvHolder.get();
    return {
      env: env.NODE_ENV,
      port: env.PORT,
      logPretty: env.LOG_PRETTY,
      production: env.NODE_ENV === "production",
    };
  }

  get database(): DatabaseConfig {
    const env = EnvHolder.get();
    return {
      url: env.DATABASE_URL,
      poolMax: env.DATABASE_POOL_MAX,
      idleTimeoutMs: env.DATABASE_POOL_IDLE_TIMEOUT_MS,
      connectionTimeoutMs: env.DATABASE_POOL_CONNECTION_TIMEOUT_MS,
    };
  }

  get authJwt(): AuthJwtConfig {
    const env = EnvHolder.get();
    return {
      accessSecret: env.JWT_ACCESS_SECRET,
      refreshSecret: env.JWT_REFRESH_SECRET,
      accessTtlSeconds: env.JWT_ACCESS_TTL_SECONDS,
      refreshTtlSeconds: env.JWT_REFRESH_TTL_SECONDS,
    };
  }

  get authPassword(): AuthPasswordConfig {
    return { bcryptCost: EnvHolder.get().BCRYPT_COST };
  }

  get corsOrigins(): string[] | "*" | undefined {
    const raw = EnvHolder.get().CORS_ORIGINS?.trim();
    if (!raw) return undefined;
    if (raw === "*") return "*";
    return raw
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean);
  }

  get trustProxy(): number | undefined {
    return EnvHolder.get().TRUST_PROXY;
  }

  get docsAuth(): { password: string } | undefined {
    const password = EnvHolder.get().DOCS_PASSWORD;
    return password ? { password } : undefined;
  }
}
