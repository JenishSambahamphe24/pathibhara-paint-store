import type { IPublicImage } from "#/types/api.types";

import { clsx } from "clsx";

interface GuideCoverProps {
  image: IPublicImage | null;
  // The fallback sign's lettering scale.
  size: "md" | "lg";
  className?: string;
  eager?: boolean;
}

const WORD_SIZE = { md: "text-[54px]", lg: "text-[96px]" };

// No cover photo: the yellow notice sign, so the card never looks broken.
export function GuideCover({
  image,
  size,
  className,
  eager = false,
}: GuideCoverProps) {
  return (
    <span className={clsx("relative block overflow-hidden", className)}>
      {image ? (
        <img
          src={image.url}
          alt={image.alt ?? ""}
          width={image.width ?? undefined}
          height={image.height ?? undefined}
          loading={eager ? "eager" : "lazy"}
          className="size-full bg-surface-2 object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className={clsx(
            "absolute inset-0 block bg-pinstripe",
            size === "lg" ? "p-2" : "p-1.5",
          )}
        >
          <span
            className={clsx(
              "flex size-full items-center justify-center rounded-[5px] border-sign-ink font-display font-semibold text-sign-ink uppercase",
              size === "lg" ? "border-[3px]" : "border-2",
              WORD_SIZE[size],
            )}
          >
            Guide
          </span>
        </span>
      )}
    </span>
  );
}
