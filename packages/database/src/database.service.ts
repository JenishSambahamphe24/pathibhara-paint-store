import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { NodePgDatabase, NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import type { PgTransaction } from "drizzle-orm/pg-core";

import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { singleton } from "tsyringe";

import * as schema from "./schema";

export type Db = NodePgDatabase<typeof schema>;
export type DbTransaction = PgTransaction<
  NodePgQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;
export type DbExecutor = Db | DbTransaction;

export interface DbPoolOptions {
  poolMax?: number;
  idleTimeoutMs?: number;
  connectionTimeoutMs?: number;
}

// Pins what a calendar day means for `date_trunc` / `date` casts on
// `timestamptz` columns, instead of inheriting the server's zone.
export const DB_SESSION_OPTIONS = "-c timezone=UTC";

// node-postgres returns int8 (bigint money columns, SUM of them, COUNT(*)) as
// strings. Money is integer paisa and never nears 2^53, so parse to a number,
// but fail loudly rather than silently lose precision if that ever changes.
const PG_INT8_OID = 20;
pg.types.setTypeParser(PG_INT8_OID, (value) => {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) {
    throw new RangeError(`int8 value ${value} exceeds Number.MAX_SAFE_INTEGER`);
  }
  return parsed;
});

@singleton()
export class DatabaseService {
  private _db: Db | null = null;
  private _pool: pg.Pool | null = null;

  async connect(url: string, options: DbPoolOptions = {}): Promise<void> {
    if (this._db) return;

    this._pool = new pg.Pool({
      connectionString: url,
      max: options.poolMax,
      idleTimeoutMillis: options.idleTimeoutMs,
      connectionTimeoutMillis: options.connectionTimeoutMs,
      options: DB_SESSION_OPTIONS,
    });
    this._db = drizzle(this._pool, { schema });
  }

  get db(): Db {
    if (!this._db) {
      throw new Error("Database not connected. Call connect() first.");
    }
    return this._db;
  }

  async disconnect(): Promise<void> {
    await this._pool?.end();
    this._pool = null;
    this._db = null;
  }
}
