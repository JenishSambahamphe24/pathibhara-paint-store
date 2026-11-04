// en-IN gives the lakh grouping (1,25,000) used for every big number.
const GROUPING = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

export class NumberHelper {
  static grouped(value: number): string {
    return GROUPING.format(value);
  }
}
