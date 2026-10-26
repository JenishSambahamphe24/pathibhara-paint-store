import { MoneyHelper } from "@repo/shared";

// en-IN gives the lakh/crore grouping (1,23,456.50) used for NPR.
const NPR_LOCALE = "en-IN";

export class CurrencyHelper {
  static formatNpr(paisa: number | null | undefined): string {
    if (paisa === null || paisa === undefined) return "—";
    return `Rs ${CurrencyHelper.formatAmount(paisa)}`;
  }

  // Splits on the integer instead of dividing, so no float ever touches money.
  static formatAmount(paisa: number): string {
    const [rupees, fraction] = MoneyHelper.toRupeesString(paisa).split(".");
    const grouped = new Intl.NumberFormat(NPR_LOCALE).format(Number(rupees));
    return `${grouped}.${fraction}`;
  }

  static toLocaleString(value: number): string {
    return new Intl.NumberFormat(NPR_LOCALE).format(value);
  }
}
