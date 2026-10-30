type TTheme = "light" | "dark";

const STORAGE_KEY = "pp-theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

export class ThemeHelper {
  // Inlined into <head> so the theme is set before first paint; a React effect
  // would flash the light theme on every dark-mode load. It always writes
  // data-theme, so CSS can key off the attribute alone.
  static readonly initScript = `(function(){var t;try{t=localStorage.getItem("${STORAGE_KEY}")}catch(e){}if(t!=="light"&&t!=="dark"){t=matchMedia("${DARK_QUERY}").matches?"dark":"light"}document.documentElement.dataset.theme=t})()`;

  static toggle(): void {
    const next: TTheme = ThemeHelper.current() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private mode or blocked storage: the switch still works for this visit.
    }
  }

  // Until the visitor picks a theme, follow the system when it changes.
  // Returns the unsubscribe function.
  static followSystem(): () => void {
    const query = window.matchMedia(DARK_QUERY);
    function onChange(event: MediaQueryListEvent) {
      if (ThemeHelper.storedChoice()) return;
      document.documentElement.dataset.theme = event.matches ? "dark" : "light";
    }
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }

  private static current(): TTheme {
    return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  }

  private static storedChoice(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }
}
