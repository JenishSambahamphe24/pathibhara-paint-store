import type { InferInsertModel } from "drizzle-orm";

import { eq } from "drizzle-orm";
import { injectable } from "tsyringe";

import { sessions, TransactionManager } from "@repo/database";

@injectable()
export class SessionRepository {
  constructor(private readonly txManager: TransactionManager) {}

  private get db() {
    return this.txManager.current();
  }

  async create(input: InferInsertModel<typeof sessions>) {
    const [row] = await this.db.insert(sessions).values(input).returning();
    return row;
  }

  async findByRefreshHash(hash: string) {
    const [row] = await this.db
      .select()
      .from(sessions)
      .where(eq(sessions.refreshTokenHash, hash))
      .limit(1);
    return row ?? undefined;
  }

  async findById(id: string) {
    const [row] = await this.db.select().from(sessions).where(eq(sessions.id, id)).limit(1);
    return row ?? undefined;
  }

  async rotateRefresh(params: { id: string; refreshTokenHash: string; expiresAt: Date }) {
    const [row] = await this.db
      .update(sessions)
      .set({ refreshTokenHash: params.refreshTokenHash, expiresAt: params.expiresAt })
      .where(eq(sessions.id, params.id))
      .returning();
    return row;
  }

  async revoke(id: string) {
    await this.db.update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.id, id));
  }
}
