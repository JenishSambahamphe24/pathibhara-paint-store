import { Dialog, Portal } from "@ark-ui/react";
import clsx from "clsx";
import { ImageOff, X } from "lucide-react";
import { useState } from "react";

type TImagePreviewSize = "xs" | "sm" | "md" | "banner";

interface ImagePreviewProps {
  src: string | null | undefined;
  alt: string;
  size?: TImagePreviewSize;
  previewSrc?: string | null;
  className?: string;
  previewClassName?: string;
}

const sizeClasses: Record<TImagePreviewSize, string> = {
  xs: "size-8",
  sm: "size-12",
  md: "size-16",
  banner: "aspect-video w-24",
};

export function ImagePreview({
  src,
  alt,
  size = "sm",
  previewSrc,
  className,
  previewClassName,
}: ImagePreviewProps) {
  // Track a src that failed to load (e.g. a dead provider image URL) so a
  // broken image degrades to the same placeholder as a missing one instead of
  // the browser's broken-image glyph. Comparing against `src` self-resets when
  // the src changes, letting the new URL attempt to load.
  const [erroredSrc, setErroredSrc] = useState<string | null>(null);

  if (!src || erroredSrc === src) {
    return (
      <div
        className={clsx(
          "flex shrink-0 items-center justify-center rounded-md bg-surface-subtle text-foreground-faint",
          sizeClasses[size],
          className,
        )}
      >
        <ImageOff size={16} />
      </div>
    );
  }

  return (
    <Dialog.Root unmountOnExit>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label={alt}
          className={clsx(
            "group relative shrink-0 cursor-zoom-in overflow-hidden rounded-md",
            "focus:ring-2 focus:ring-foreground/20 focus:outline-none",
            sizeClasses[size],
            className,
          )}
        >
          <img
            src={src}
            alt={alt}
            loading="lazy"
            onError={() => setErroredSrc(src)}
            className="size-full bg-surface-subtle object-cover"
          />
        </button>
      </Dialog.Trigger>

      <Portal>
        <Dialog.Backdrop className="fixed inset-0 z-60 bg-overlay/80 backdrop-blur-sm" />
        <Dialog.Positioner className="fixed inset-0 z-70 flex items-center justify-center p-6">
          <Dialog.Content
            className={clsx(
              "relative flex max-h-full max-w-full items-center justify-center",
              "animate-in fade-in-0 zoom-in-95",
            )}
          >
            <Dialog.CloseTrigger
              aria-label={alt}
              className={clsx(
                "absolute -top-3 -right-3 z-10 rounded-full bg-surface p-1.5 text-foreground-muted shadow-lg",
                "cursor-pointer transition-colors hover:bg-surface-subtle",
                "focus:ring-2 focus:ring-foreground/20 focus:outline-none",
              )}
            >
              <X size={18} />
            </Dialog.CloseTrigger>
            <img
              src={previewSrc ?? src}
              alt={alt}
              className={clsx(
                "rounded-lg object-contain shadow-2xl",
                previewClassName ?? "max-h-screen max-w-full",
              )}
            />
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
