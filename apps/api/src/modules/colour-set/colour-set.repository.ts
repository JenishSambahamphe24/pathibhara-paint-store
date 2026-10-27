import type { ColourSetListQuery, DescribedTranslations, VisualizerComponent } from "@repo/shared";
import type { SQL } from "drizzle-orm";

import { and, asc, desc, eq, ilike, ne, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { injectable } from "tsyringe";

import { colourSets, colourSetTranslations, TransactionManager } from "@repo/database";
import { PaginationHelper } from "@repo/http-kit";

import { LikeHelper } from "#helpers/like.helper";

export type ColourSetRow = typeof colourSets.$inferSelect;

export const COMPONENT_COLUMNS = {
  main_surface: "mainSurfaceShadeId",
  columns: "columnsShadeId",
  doors_windows: "doorsWindowsShadeId",
  roof_edge: "roofEdgeShadeId",
} as const satisfies Record<VisualizerComponent, keyof ColourSetRow>;

const enName = alias(colourSetTranslations, "en_name");
const neName = alias(colourSetTranslations, "ne_name");

@injectable()
export class ColourSetRepository {
  constructor(private readonly txManager: TransactionManager) {}

  private get db() {
    return this.txManager.current();
  }

  async list(query: ColourSetListQuery) {
    const where = this.listWhere(query);
    const sortColumn = { name: enName.name, updatedAt: colourSets.updatedAt }[query.sortBy];
    const direction = query.sortOrder === "asc" ? asc : desc;

    const rows = await this.db
      .select({
        colourSet: colourSets,
        name: enName.name,
        hasNepali: sql<boolean>`${neName.colourSetId} IS NOT NULL`,
      })
      .from(colourSets)
      .innerJoin(enName, and(eq(enName.colourSetId, colourSets.id), eq(enName.locale, "en")))
      .leftJoin(neName, and(eq(neName.colourSetId, colourSets.id), eq(neName.locale, "ne")))
      .where(where)
      .orderBy(direction(sortColumn), desc(colourSets.id))
      .limit(query.perPage)
      .offset(PaginationHelper.offset(query.page, query.perPage));

    const [{ total }] = await this.db
      .select({ total: sql<number>`count(*)::int` })
      .from(colourSets)
      .innerJoin(enName, and(eq(enName.colourSetId, colourSets.id), eq(enName.locale, "en")))
      .leftJoin(neName, and(eq(neName.colourSetId, colourSets.id), eq(neName.locale, "ne")))
      .where(where);

    return { rows, total };
  }

  private listWhere(query: ColourSetListQuery): SQL | undefined {
    const conditions: Array<SQL | undefined> = [];
    if (query.search) {
      const term = LikeHelper.contains(query.search);
      conditions.push(
        or(ilike(colourSets.slug, term), ilike(enName.name, term), ilike(neName.name, term)),
      );
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

  async findTranslations(colourSetId: string) {
    return this.db
      .select()
      .from(colourSetTranslations)
      .where(eq(colourSetTranslations.colourSetId, colourSetId));
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

  async saveTranslations(colourSetId: string, translations: DescribedTranslations): Promise<void> {
    await this.db
      .insert(colourSetTranslations)
      .values({ colourSetId, locale: "en", ...translations.en })
      .onConflictDoUpdate({
        target: [colourSetTranslations.colourSetId, colourSetTranslations.locale],
        set: translations.en,
      });

    if (translations.ne.name) {
      const ne = { ...translations.ne, name: translations.ne.name };
      await this.db
        .insert(colourSetTranslations)
        .values({ colourSetId, locale: "ne", ...ne })
        .onConflictDoUpdate({
          target: [colourSetTranslations.colourSetId, colourSetTranslations.locale],
          set: ne,
        });
    } else {
      await this.db
        .delete(colourSetTranslations)
        .where(
          and(
            eq(colourSetTranslations.colourSetId, colourSetId),
            eq(colourSetTranslations.locale, "ne"),
          ),
        );
    }
  }
}
