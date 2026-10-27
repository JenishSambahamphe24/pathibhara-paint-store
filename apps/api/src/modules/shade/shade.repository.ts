import type { NameTranslations, ShadeListQuery } from "@repo/shared";
import type { SQL } from "drizzle-orm";

import { and, asc, desc, eq, ilike, inArray, ne, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { injectable } from "tsyringe";

import {
  colourSets,
  colourSetTranslations,
  productTranslations,
  shades,
  shadeTranslations,
  TransactionManager,
} from "@repo/database";
import { PaginationHelper } from "@repo/http-kit";

import { LikeHelper } from "#helpers/like.helper";

export type ShadeRow = typeof shades.$inferSelect;

const enName = alias(shadeTranslations, "en_name");
const neName = alias(shadeTranslations, "ne_name");
const productName = alias(productTranslations, "product_name");

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
      name: enName.name,
      updatedAt: shades.updatedAt,
    }[query.sortBy];
    const direction = query.sortOrder === "asc" ? asc : desc;

    const rows = await this.db
      .select({
        shade: shades,
        name: enName.name,
        hasNepali: sql<boolean>`${neName.shadeId} IS NOT NULL`,
        productName: productName.name,
        colourSetCount: sql<number>`(SELECT count(*)::int FROM ${colourSets} WHERE ${this.usedBy(shades.id)})`,
      })
      .from(shades)
      .innerJoin(enName, and(eq(enName.shadeId, shades.id), eq(enName.locale, "en")))
      .leftJoin(neName, and(eq(neName.shadeId, shades.id), eq(neName.locale, "ne")))
      .leftJoin(
        productName,
        and(eq(productName.productId, shades.productId), eq(productName.locale, "en")),
      )
      .where(where)
      .orderBy(direction(sortColumn), asc(shades.code))
      .limit(query.perPage)
      .offset(PaginationHelper.offset(query.page, query.perPage));

    const [{ total }] = await this.db
      .select({ total: sql<number>`count(*)::int` })
      .from(shades)
      .innerJoin(enName, and(eq(enName.shadeId, shades.id), eq(enName.locale, "en")))
      .leftJoin(neName, and(eq(neName.shadeId, shades.id), eq(neName.locale, "ne")))
      .where(where);

    return { rows, total };
  }

  private listWhere(query: ShadeListQuery): SQL | undefined {
    const conditions: Array<SQL | undefined> = [];
    if (query.search) {
      const term = LikeHelper.contains(query.search);
      conditions.push(
        or(ilike(shades.code, term), ilike(enName.name, term), ilike(neName.name, term)),
      );
    }
    if (query.status) conditions.push(eq(shades.isActive, query.status === "active"));
    return and(...conditions);
  }

  async findDetail(id: string) {
    const [row] = await this.db
      .select({
        shade: shades,
        productName: productName.name,
        colourSetCount: sql<number>`(SELECT count(*)::int FROM ${colourSets} WHERE ${this.usedBy(shades.id)})`,
      })
      .from(shades)
      .leftJoin(
        productName,
        and(eq(productName.productId, shades.productId), eq(productName.locale, "en")),
      )
      .where(eq(shades.id, id))
      .limit(1);
    return row;
  }

  async findTranslations(shadeId: string) {
    return this.db.select().from(shadeTranslations).where(eq(shadeTranslations.shadeId, shadeId));
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
        name: enName.name,
      })
      .from(shades)
      .innerJoin(enName, and(eq(enName.shadeId, shades.id), eq(enName.locale, "en")))
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
        name: enName.name,
      })
      .from(shades)
      .innerJoin(enName, and(eq(enName.shadeId, shades.id), eq(enName.locale, "en")))
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
    const rows = await this.db
      .select({ name: colourSetTranslations.name })
      .from(colourSets)
      .innerJoin(
        colourSetTranslations,
        and(
          eq(colourSetTranslations.colourSetId, colourSets.id),
          eq(colourSetTranslations.locale, "en"),
        ),
      )
      .where(and(eq(colourSets.isActive, true), this.usedBy(shadeId)))
      .orderBy(asc(colourSetTranslations.name));
    return rows.map((r) => r.name);
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

  async saveTranslations(shadeId: string, translations: NameTranslations): Promise<void> {
    await this.db
      .insert(shadeTranslations)
      .values({ shadeId, locale: "en", name: translations.en.name })
      .onConflictDoUpdate({
        target: [shadeTranslations.shadeId, shadeTranslations.locale],
        set: { name: translations.en.name },
      });

    if (translations.ne.name) {
      await this.db
        .insert(shadeTranslations)
        .values({ shadeId, locale: "ne", name: translations.ne.name })
        .onConflictDoUpdate({
          target: [shadeTranslations.shadeId, shadeTranslations.locale],
          set: { name: translations.ne.name },
        });
    } else {
      await this.db
        .delete(shadeTranslations)
        .where(and(eq(shadeTranslations.shadeId, shadeId), eq(shadeTranslations.locale, "ne")));
    }
  }
}
