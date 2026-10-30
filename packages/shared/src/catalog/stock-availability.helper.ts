import type { StockAvailability } from "./constants";

export class StockAvailabilityHelper {
  // Uses the same "at or below reorder level" line as the admin's low-stock
  // flag. Out of stock reads as "ask in store" because the shop may restock
  // or hold stock the ledger hasn't caught up with yet.
  static of(currentStock: number, reorderLevel: number): StockAvailability {
    if (currentStock <= 0) return "askInStore";
    if (currentStock <= reorderLevel) return "lowStock";
    return "inStock";
  }
}
