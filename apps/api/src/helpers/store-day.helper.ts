import type { AnyColumn, SQL } from "drizzle-orm";

import { gte, lt, sql } from "drizzle-orm";

import { STORE_TIMEZONE } from "@repo/shared";

// Turns store calendar dates (inclusive) into bounds on a timestamptz column,
// so "26 Oct" means midnight-to-midnight in Kathmandu, not UTC.
export class StoreDayHelper {
  static from(column: AnyColumn, date: string): SQL {
    return gte(column, sql`(${date}::date)::timestamp AT TIME ZONE ${STORE_TIMEZONE}`);
  }

  static to(column: AnyColumn, date: string): SQL {
    return lt(column, sql`(${date}::date + 1)::timestamp AT TIME ZONE ${STORE_TIMEZONE}`);
  }
}
