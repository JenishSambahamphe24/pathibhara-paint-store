export class LikeHelper {
  // For ILIKE: the search box text is literal, so its % and _ must not act
  // as wildcards.
  static contains(term: string): string {
    return `%${term.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
  }
}
