import type { Db } from "@repo/database";

import { storeSettings } from "@repo/database";

export class StoreSettingsSeed {
  static async ensure(db: Db): Promise<void> {
    const inserted = await db
      .insert(storeSettings)
      .values({ id: 1, storeName: "Pathibhara Paints" })
      .onConflictDoNothing()
      .returning({ id: storeSettings.id });
    if (inserted.length > 0) console.warn("Created store settings (10% default wastage).");
  }
}
