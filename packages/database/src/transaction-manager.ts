import { AsyncLocalStorage } from "node:async_hooks";

import { singleton } from "tsyringe";

import { DatabaseService } from "./database.service";

import type { DbExecutor, DbTransaction } from "./database.service";

export interface TransactionOptions {
  isolationLevel?:
    | "read uncommitted"
    | "read committed"
    | "repeatable read"
    | "serializable";
  accessMode?: "read write" | "read only";
  deferrable?: boolean;
}

export type AfterCommitHook = () => Promise<void> | void;

interface TransactionContext {
  tx: DbTransaction;
  afterCommit: AfterCommitHook[];
}

@singleton()
export class TransactionManager {
  private readonly storage = new AsyncLocalStorage<TransactionContext>();

  constructor(private readonly databaseService: DatabaseService) {}

  current(): DbExecutor {
    return this.storage.getStore()?.tx ?? this.databaseService.db;
  }

  /**
   * Defers `hook` until the outermost transaction commits — or runs it now if
   * no transaction is in flight. For side effects that must not be able to fail
   * the transaction (deleting a stored file, say) and must not happen at all if
   * it rolls back.
   *
   * A hook runs with no caller left to answer to, so it must handle its own
   * errors: a throw is swallowed rather than surfaced to a request whose work
   * has already been committed.
   */
  async afterCommit(hook: AfterCommitHook): Promise<void> {
    const ctx = this.storage.getStore();
    if (!ctx) {
      await hook();
      return;
    }
    ctx.afterCommit.push(hook);
  }

  async run<T>(fn: () => Promise<T>, options?: TransactionOptions): Promise<T> {
    if (this.storage.getStore()) return fn();

    const hooks: AfterCommitHook[] = [];
    const result = await this.databaseService.db.transaction(
      (tx) => this.storage.run({ tx, afterCommit: hooks }, fn),
      options,
    );

    for (const hook of hooks) {
      try {
        await hook();
      } catch {
        // Contract of `afterCommit`: the transaction is committed and the
        // caller is owed its response, so one bad hook can't fail the request
        // or skip the hooks behind it.
      }
    }

    return result;
  }
}
