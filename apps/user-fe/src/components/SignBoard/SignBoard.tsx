import type { ReactNode } from "react";

import { clsx } from "clsx";

type TSignBoardVariant = "header" | "section" | "notice";

const PLATE: Record<TSignBoardVariant, string> = {
  header: "bg-sign-red",
  section: "bg-sign-blue",
  notice: "bg-pinstripe",
};

const FRAME: Record<TSignBoardVariant, string> = {
  header: "border-pinstripe text-sign-cream",
  section: "border-sign-cream text-sign-cream",
  notice: "border-sign-ink text-sign-ink",
};

const KICKER: Record<TSignBoardVariant, string> = {
  header: "text-pinstripe",
  section: "text-pinstripe",
  notice: "text-sign-ink",
};

interface SignBoardProps {
  variant?: TSignBoardVariant;
  kicker?: string;
  title?: ReactNode;
  as?: "h1" | "h2" | "h3" | "span";
  // "lg" grows the title on desktop, for a page's section signs.
  size?: "md" | "lg";
  className?: string;
  children?: ReactNode;
}

// Sign colours stay the same in both themes. Never put a signboard behind
// paint swatches, the 3D house or form fields.
export function SignBoard({
  variant = "section",
  kicker,
  title,
  as: Heading = "h2",
  size = "md",
  className,
  children,
}: SignBoardProps) {
  return (
    <div className={clsx("rounded-sign p-[5px]", PLATE[variant], className)}>
      <div
        className={clsx(
          "rounded-sign-inner border-2 px-3 pt-2 pb-1",
          FRAME[variant],
        )}
      >
        {kicker && (
          <span
            className={clsx(
              "block font-body text-xs font-bold tracking-[0.16em] uppercase",
              KICKER[variant],
            )}
          >
            {kicker}
          </span>
        )}
        {title && (
          <Heading
            className={clsx(
              "m-0 font-display text-[34px] leading-[0.9] font-semibold uppercase",
              size === "lg" && "lg:text-[44px]",
            )}
          >
            {title}
          </Heading>
        )}
        {children}
      </div>
    </div>
  );
}
