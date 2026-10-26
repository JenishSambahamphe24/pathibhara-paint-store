import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { admins } from "./admin.schema";
import { primaryId, timestamps } from "./columns";

export const sessions = pgTable(
  "sessions",
  {
    id: primaryId(),
    adminId: uuid("admin_id")
      .notNull()
      .references(() => admins.id, { onDelete: "cascade" }),
    // SHA-256 of the refresh JWT; the token itself is never stored.
    refreshTokenHash: text("refresh_token_hash").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [index("sessions_admin_id_idx").on(table.adminId)],
);
