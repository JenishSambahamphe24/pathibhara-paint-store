const COMBINING_DIACRITICAL_MARKS = /\p{Mn}+/gu;

export class SlugHelper {
  static readonly PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  // Returns "" for empty / symbol-only input; callers must handle that.
  static fromText(input: string): string {
    return input
      .normalize("NFKD")
      .replace(COMBINING_DIACRITICAL_MARKS, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
}
