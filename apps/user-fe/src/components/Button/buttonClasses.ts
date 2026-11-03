const BASE =
  "flex items-center justify-center rounded-control px-[18px] pt-[3px] font-display leading-none font-semibold tracking-[0.04em] uppercase";

// For links styled as buttons (TanStack <Link> or a plain <a>), which can't
// share one component.
export const BUTTON_CLASSES = {
  primary: `${BASE} bg-ink text-on-ink`,
  secondary: `${BASE} border-2 border-ink text-ink`,
};
