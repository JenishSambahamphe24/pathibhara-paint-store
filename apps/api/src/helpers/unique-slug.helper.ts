import { ValidationException } from "@repo/http-kit";
import { SLUG_MAX_LENGTH, SlugHelper } from "@repo/shared";

import { tk } from "#i18n/tk";

export class UniqueSlugHelper {
  // An admin-typed slug must be free as given; a derived one gets a numeric
  // suffix ("apex-royal-2") until it is.
  static async resolve(
    requested: string,
    fallbackName: string,
    isTaken: (slug: string) => Promise<boolean>,
  ): Promise<string> {
    if (requested) {
      if (await isTaken(requested)) throw new ValidationException({ slug: tk("slug.taken") });
      return requested;
    }

    const base = SlugHelper.fromText(fallbackName).slice(0, SLUG_MAX_LENGTH - 4) || "item";
    let candidate = base;
    for (let suffix = 2; await isTaken(candidate); suffix++) {
      candidate = `${base}-${suffix}`;
    }
    return candidate;
  }
}
