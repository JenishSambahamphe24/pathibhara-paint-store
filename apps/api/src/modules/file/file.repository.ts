import type { InferInsertModel } from "drizzle-orm";

import { inArray } from "drizzle-orm";
import { injectable } from "tsyringe";

import { files, TransactionManager } from "@repo/database";

export type FileRow = typeof files.$inferSelect;

@injectable()
export class FileRepository {
  constructor(private readonly txManager: TransactionManager) {}

  private get db() {
    return this.txManager.current();
  }

  async create(input: InferInsertModel<typeof files>): Promise<FileRow> {
    const [row] = await this.db.insert(files).values(input).returning();
    return row;
  }

  async findByIds(ids: Array<string>): Promise<Array<FileRow>> {
    if (ids.length === 0) return [];
    return this.db.select().from(files).where(inArray(files.id, ids));
  }
}
