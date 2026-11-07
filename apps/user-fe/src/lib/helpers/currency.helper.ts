import { MoneyHelper } from "@repo/shared";

// en-IN gives the lakh/crore grouping (1,25,000) used for NPR.
const NPR_LOCALE = "en-IN";
const ML_PER_LITRE = 1000;

export class CurrencyHelper {
  // Customer-facing prices: "Rs. 1,25,000", paisa shown only when there are any.
  static formatNpr(paisa: number): string {
    const sign = paisa < 0 ? "-" : "";
    const [rupees, fraction] = MoneyHelper.toRupeesString(
      Math.abs(paisa),
    ).split(".");
    const grouped = new Intl.NumberFormat(NPR_LOCALE).format(Number(rupees));
    return `${sign}Rs. ${grouped}${fraction === "00" ? "" : `.${fraction}`}`;
  }

  // Rounded to whole paisa before formatting, so the float never reaches the text.
  static formatPerLitre(pricePaisa: number, volumeMl: number): string {
    const perLitrePaisa = Math.round((pricePaisa * ML_PER_LITRE) / volumeMl);
    return `${CurrencyHelper.formatNpr(perLitrePaisa)} / L`;
  }
}
