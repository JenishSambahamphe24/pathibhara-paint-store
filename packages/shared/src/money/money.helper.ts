import { z } from "zod";

export const PAISA_PER_RUPEE = 100;

// 10 crore rupees: far above any single price, and small enough that sums of
// thousands of line items stay exact as JS numbers.
export const MAX_PRICE_PAISA = 10_000_000_000;

const RUPEES_PATTERN = /^\d+(\.\d{1,2})?$/;

export const paisaSchema = z
  .number()
  .int("Amount must be in whole paisa")
  .nonnegative("Amount can't be negative")
  .max(MAX_PRICE_PAISA, "Amount is too large");

export class MoneyHelper {
  // Parses what an admin types ("1250", "1,250.5") without going through a
  // float, so "0.29" is exactly 29 paisa. Returns null for anything else.
  static parseRupees(input: string): number | null {
    const cleaned = input.replace(/,/g, "").trim();
    if (!RUPEES_PATTERN.test(cleaned)) return null;
    const [rupees, fraction = ""] = cleaned.split(".");
    const paisa = Number(rupees) * PAISA_PER_RUPEE + Number(fraction.padEnd(2, "0"));
    return Number.isSafeInteger(paisa) ? paisa : null;
  }

  // "125050" -> "1250.50", the value a rupee input field shows.
  static toRupeesString(paisa: number): string {
    const sign = paisa < 0 ? "-" : "";
    const abs = Math.abs(paisa);
    const rupees = Math.trunc(abs / PAISA_PER_RUPEE);
    const fraction = String(abs % PAISA_PER_RUPEE).padStart(2, "0");
    return `${sign}${rupees}.${fraction}`;
  }

  static multiply(paisa: number, quantity: number): number {
    const result = paisa * quantity;
    if (!Number.isSafeInteger(result)) throw new RangeError("Money overflow");
    return result;
  }
}
