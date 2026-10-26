const ML_PER_LITRE = 1000;
const LITRES_PATTERN = /^\d+(\.\d{1,3})?$/;

export class VolumeHelper {
  // "0.5" -> 500; parsed as text so no float rounding can creep into ml.
  static parseLitres(input: string): number | null {
    const cleaned = input.trim();
    if (!LITRES_PATTERN.test(cleaned)) return null;
    const [whole, fraction = ""] = cleaned.split(".");
    const ml = Number(whole) * ML_PER_LITRE + Number(fraction.padEnd(3, "0"));
    return ml > 0 && Number.isSafeInteger(ml) ? ml : null;
  }

  // 500 -> "0.5", 20000 -> "20"
  static toLitresString(ml: number): string {
    const whole = Math.trunc(ml / ML_PER_LITRE);
    const fraction = String(ml % ML_PER_LITRE)
      .padStart(3, "0")
      .replace(/0+$/, "");
    return fraction ? `${whole}.${fraction}` : String(whole);
  }

  static label(ml: number): string {
    return `${VolumeHelper.toLitresString(ml)} L`;
  }
}
