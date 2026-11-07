import type { ShadeListQuery } from "@repo/shared";
import type { SQL } from "drizzle-orm";

import { and, asc, desc, eq, ilike, inArray, ne, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { injectable } from "tsyringe";

import { colourSets, products, shades, TransactionManager } from "@repo/database";
import { PaginationHelper } from "@repo/http-kit";

import { LikeHelper } from "#helpers/like.helper";
import { PublicVisibilityHelper } from "#helpers/public-visibility.helper";

export type ShadeRow = typeof shades.$inferSelect;

const shadeProduct = alias(products, "shade_product");

@injectable()
export class ShadeRepository {
  constructor(private readonly txManager: TransactionManager) {}

  private get db() {
    return this.txManager.current();
  }

  // Colour sets reference a shade from any of their four component columns.
  private usedBy(shadeId: SQL | typeof shades.id | string): SQL {
    return sql`${shadeId} IN (${colourSets.mainSurfaceShadeId}, ${colourSets.columnsShadeId}, ${colourSets.doorsWindowsShadeId}, ${colourSets.roofEdgeShadeId})`;
  }

  async list(query: ShadeListQuery) {
    const where = this.listWhere(query);
    const sortColumn = {
      code: shades.code,
      name: shades.name,
      updatedAt: shades.updatedAt,
    }[query.sortBy];
    const direction = query.sortOrder === "asc" ? asc : desc;

    const rows = await this.db
      .select({
        shade: shades,
        productName: shadeProduct.name,
        colourSetCount: sql<number>`(SELECT count(*)::int FROM ${colourSets} WHERE ${this.usedBy(shades.id)})`,
      })
      .from(shades)
      .leftJoin(shadeProduct, eq(shadeProduct.id, shades.productId))
      .where(where)
      .orderBy(direction(sortColumn), asc(shades.code))
      .limit(query.perPage)
      .offset(PaginationHelper.offset(query.page, query.perPage));

    const [{ total }] = await this.db
      .select({ total: sql<number>`count(*)::int` })
      .from(shades)
      .where(where);

    return { rows, total };
  }

  private listWhere(query: ShadeListQuery): SQL | undefined {
    const conditions: Array<SQL | undefined> = [];
    if (query.search) {
      const term = LikeHelper.contains(query.search);
      conditions.push(or(ilike(shades.code, term), ilike(shades.name, term)));
    }
    if (query.status) conditions.push(eq(shades.isActive, query.status === "active"));
    return and(...conditions);
  }

  async findDetail(id: string) {
    const [row] = await this.db
      .select({
        shade: shades,
        productName: shadeProduct.name,
        colourSetCount: sql<number>`(SELECT count(*)::int FROM ${colourSets} WHERE ${this.usedBy(shades.id)})`,
      })
      .from(shades)
      .leftJoin(shadeProduct, eq(shadeProduct.id, shades.productId))
      .where(eq(shades.id, id))
      .limit(1);
    return row;
  }

  async lockById(id: string): Promise<ShadeRow | undefined> {
    const [row] = await this.db
      .select()
      .from(shades)
      .where(eq(shades.id, id))
      .limit(1)
      .for("update");
    return row;
  }

  // FOR SHARE: a colour set being saved keeps its shades from being
  // deactivated or deleted until it commits (those take FOR UPDATE).
  async lockSummaries(ids: Array<string>) {
    if (ids.length === 0) return [];
    return this.db
      .select({
        id: shades.id,
        code: shades.code,
        hex: shades.hex,
        isActive: shades.isActive,
        name: shades.name,
      })
      .from(shades)
      .where(inArray(shades.id, ids))
      .for("share", { of: shades });
  }

  async findSummaries(ids: Array<string>) {
    if (ids.length === 0) return [];
    return this.db
      .select({
        id: shades.id,
        code: shades.code,
        hex: shades.hex,
        isActive: shades.isActive,
        name: shades.name,
      })
      .from(shades)
      .where(inArray(shades.id, ids));
  }

  async codeTaken(code: string, exceptId?: string): Promise<boolean> {
    const [row] = await this.db
      .select({ id: shades.id })
      .from(shades)
      .where(exceptId ? and(eq(shades.code, code), ne(shades.id, exceptId)) : eq(shades.code, code))
      .limit(1);
    return !!row;
  }

  async countSetsUsing(shadeId: string): Promise<number> {
    const [row] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(colourSets)
      .where(this.usedBy(shadeId));
    return row.count;
  }

  async activeSetNamesUsing(shadeId: string): Promise<Array<string>> {
    return (await this.activeSetsUsing(shadeId)).map((r) => r.name);
  }

  async activeSetsUsing(shadeId: string) {
    return this.db
      .select({ slug: colourSets.slug, name: colourSets.name })
      .from(colourSets)
      .where(and(PublicVisibilityHelper.colourSet(), this.usedBy(shadeId)))
      .orderBy(asc(colourSets.name));
  }

  async findActiveByCode(code: string): Promise<ShadeRow | undefined> {
    const [row] = await this.db
      .select()
      .from(shades)
      .where(and(eq(shades.code, code), eq(shades.isActive, true)))
      .limit(1);
    return row;
  }

  async findActiveByProduct(productId: string) {
    return this.db
      .select({ code: shades.code, name: shades.name, hex: shades.hex })
      .from(shades)
      .where(and(eq(shades.productId, productId), eq(shades.isActive, true)))
      .orderBy(asc(shades.sortOrder), asc(shades.code));
  }

  async create(values: typeof shades.$inferInsert): Promise<ShadeRow> {
    const [row] = await this.db.insert(shades).values(values).returning();
    return row;
  }

  async update(id: string, values: Partial<typeof shades.$inferInsert>): Promise<void> {
    await this.db.update(shades).set(values).where(eq(shades.id, id));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(shades).where(eq(shades.id, id));
  }
}
