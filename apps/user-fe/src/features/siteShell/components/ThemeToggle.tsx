import { clsx } from "clsx";
import { Moon, Sun } from "lucide-react";
import { useEffect } from "react";

import { ThemeHelper } from "#/lib/helpers/theme.helper";

interface ThemeToggleProps {
  tone: "sign" | "plain";
}

// The icon swaps through the dark: variant rather than React state, so the
// server render never disagrees with the theme the head script picked.
export function ThemeToggle({ tone }: ThemeToggleProps) {
  useEffect(() => ThemeHelper.followSystem(), []);

  return (
    <button
      type="button"
      aria-label="Switch between light and dark theme"
      onClick={ThemeHelper.toggle}
      className={clsx(
        "flex size-tap items-center justify-center",
        tone === "sign"
          ? "text-sign-cream"
          : "rounded-card border border-line bg-surface text-ink",
      )}
    >
      <Moon size={20} aria-hidden="true" className="dark:hidden" />
      <Sun size={20} aria-hidden="true" className="hidden dark:block" />
    </button>
  );
}
