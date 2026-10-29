import type { ColourSetListQuery, VisualizerComponent } from "@repo/shared";
import type { SQL } from "drizzle-orm";

import { and, asc, desc, eq, ilike, ne, or, sql } from "drizzle-orm";
import { injectable } from "tsyringe";

import { colourSets, TransactionManager } from "@repo/database";
import { PaginationHelper } from "@repo/http-kit";

import { LikeHelper } from "#helpers/like.helper";

export type ColourSetRow = typeof colourSets.$inferSelect;

export const COMPONENT_COLUMNS = {
  main_surface: "mainSurfaceShadeId",
  columns: "columnsShadeId",
  doors_windows: "doorsWindowsShadeId",
  roof_edge: "roofEdgeShadeId",
} as const satisfies Record<VisualizerComponent, keyof ColourSetRow>;

@injectable()
export class ColourSetRepository {
  constructor(private readonly txManager: TransactionManager) {}

  private get db() {
    return this.txManager.current();
  }

  async list(query: ColourSetListQuery) {
    const where = this.listWhere(query);
    const sortColumn = { name: colourSets.name, updatedAt: colourSets.updatedAt }[query.sortBy];
    const direction = query.sortOrder === "asc" ? asc : desc;

    const rows = await this.db
      .select({ colourSet: colourSets })
      .from(colourSets)
      .where(where)
      .orderBy(direction(sortColumn), desc(colourSets.id))
      .limit(query.perPage)
      .offset(PaginationHelper.offset(query.page, query.perPage));

    const [{ total }] = await this.db
      .select({ total: sql<number>`count(*)::int` })
      .from(colourSets)
      .where(where);

    return { rows, total };
  }

  private listWhere(query: ColourSetListQuery): SQL | undefined {
    const conditions: Array<SQL | undefined> = [];
    if (query.search) {
      const term = LikeHelper.contains(query.search);
      conditions.push(or(ilike(colourSets.slug, term), ilike(colourSets.name, term)));
    }
    if (query.status) conditions.push(eq(colourSets.isActive, query.status === "active"));
    if (query.shadeId) {
      conditions.push(
        sql`${query.shadeId} IN (${colourSets.mainSurfaceShadeId}, ${colourSets.columnsShadeId}, ${colourSets.doorsWindowsShadeId}, ${colourSets.roofEdgeShadeId})`,
      );
    }
    return and(...conditions);
  }

  async findById(id: string): Promise<ColourSetRow | undefined> {
    const [row] = await this.db.select().from(colourSets).where(eq(colourSets.id, id)).limit(1);
    return row;
  }

  async lockById(id: string): Promise<ColourSetRow | undefined> {
    const [row] = await this.db
      .select()
      .from(colourSets)
      .where(eq(colourSets.id, id))
      .limit(1)
      .for("update");
    return row;
  }

  async slugTaken(slug: string, exceptId?: string): Promise<boolean> {
    const [row] = await this.db
      .select({ id: colourSets.id })
      .from(colourSets)
      .where(
        exceptId
          ? and(eq(colourSets.slug, slug), ne(colourSets.id, exceptId))
          : eq(colourSets.slug, slug),
      )
      .limit(1);
    return !!row;
  }

  async create(values: typeof colourSets.$inferInsert): Promise<ColourSetRow> {
    const [row] = await this.db.insert(colourSets).values(values).returning();
    return row;
  }

  async update(id: string, values: Partial<typeof colourSets.$inferInsert>): Promise<void> {
    await this.db.update(colourSets).set(values).where(eq(colourSets.id, id));
  }
}
