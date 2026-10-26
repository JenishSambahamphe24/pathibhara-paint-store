import clsx from "clsx";
import { PaintBucket } from "lucide-react";

import { m } from "#/paraglide/messages";

interface LogoProps {
  onLight?: boolean;
  className?: string;
}

export function Logo({ onLight = false, className }: LogoProps) {
  return (
    <span
      className={clsx(
        "flex items-center gap-2 font-semibold tracking-tight",
        onLight
          ? "text-2xl text-foreground"
          : "text-lg text-primary-foreground",
        className,
      )}
    >
      <PaintBucket size={onLight ? 32 : 24} aria-hidden />
      {m.app_name()}
    </span>
  );
}
