import type { Db } from "@repo/database";

import bcrypt from "bcrypt";
import { eq, sql } from "drizzle-orm";

import { admins } from "@repo/database";

interface AdminSeedEnv {
  SUPER_ADMIN_EMAIL?: string;
  SUPER_ADMIN_PASSWORD?: string;
  SUPER_ADMIN_NAME: string;
  BCRYPT_COST: number;
}

export class AdminSeed {
  static async admin(db: Db, env: AdminSeedEnv): Promise<void> {
    if (!env.SUPER_ADMIN_EMAIL || !env.SUPER_ADMIN_PASSWORD) {
      console.warn("SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD not set; skipping admin seed.");
      return;
    }

    const email = env.SUPER_ADMIN_EMAIL.toLowerCase();
    const [existing] = await db
      .select({ id: admins.id })
      .from(admins)
      .where(eq(sql`lower(${admins.email})`, email))
      .limit(1);
    if (existing) {
      console.warn(`Admin ${email} already exists; skipping.`);
      return;
    }

    await db.insert(admins).values({
      email,
      name: env.SUPER_ADMIN_NAME,
      passwordHash: await bcrypt.hash(env.SUPER_ADMIN_PASSWORD, env.BCRYPT_COST),
    });
    console.warn(`Created admin ${email}.`);
  }
}
