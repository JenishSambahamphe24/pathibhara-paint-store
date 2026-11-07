import { BsDateHelper } from "@repo/shared";

export class DateHelper {
  // "10 Kartik 2083": the Bikram Sambat date in Nepal at that instant.
  static bsLong(iso: string): string {
    return BsDateHelper.format(BsDateHelper.fromInstant(new Date(iso)), "long");
  }
}
