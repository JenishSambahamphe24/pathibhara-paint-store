import { useMediaQuery } from "#/hooks/useMediaQuery";

// Same condition as the `wide:` variant in styles/tokens.css.
const WIDE_QUERY =
  "(min-width: 48rem), (orientation: landscape) and (min-width: 40rem)";

export function useIsWide(): boolean {
  return useMediaQuery(WIDE_QUERY);
}
