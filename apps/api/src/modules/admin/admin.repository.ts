import type { InferInsertModel } from "drizzle-orm";

import { eq, sql } from "drizzle-orm";
import { injectable } from "tsyringe";

import { admins, TransactionManager } from "@repo/database";

@injectable()
export class AdminRepository {
  constructor(private readonly txManager: TransactionManager) {}

  private get db() {
    return this.txManager.current();
  }

  async findByEmail(email: string) {
    const [row] = await this.db
      .select()
      .from(admins)
      .where(eq(sql`lower(${admins.email})`, email.toLowerCase()))
      .limit(1);
    return row ?? undefined;
  }

  async findById(id: string) {
    const [row] = await this.db.select().from(admins).where(eq(admins.id, id)).limit(1);
    return row ?? undefined;
  }

  async create(input: InferInsertModel<typeof admins>) {
    const [row] = await this.db.insert(admins).values(input).returning();
    return row;
  }

  async touchLastLogin(id: string, at: Date) {
    await this.db.update(admins).set({ lastLoginAt: at }).where(eq(admins.id, id));
  }
}
