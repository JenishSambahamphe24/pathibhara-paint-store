import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

import { primaryId, timestamps } from "./columns";
import { adminStatusEnum } from "./enums";

export const admins = pgTable(
  "admins",
  {
    id: primaryId(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    status: adminStatusEnum("status").notNull().default("active"),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [uniqueIndex("admins_email_uq").on(sql`lower(${table.email})`)],
);
