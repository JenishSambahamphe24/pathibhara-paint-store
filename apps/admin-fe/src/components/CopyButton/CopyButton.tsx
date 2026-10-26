import { Portal, Tooltip } from "@ark-ui/react";
import clsx from "clsx";
import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { m } from "#/paraglide/messages";

interface CopyButtonProps {
  getContent: () => string;
  iconSize?: number;
  className?: string;
}

const COPY_FEEDBACK_MS = 2000;

export function CopyButton({
  getContent,
  iconSize = 16,
  className,
}: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  async function handleCopy() {
    if (isCopied) return;
    const text = getContent();
    if (!text) return;
    await navigator.clipboard.writeText(text);

    setIsCopied(true);
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      setIsCopied(false);
      timeoutRef.current = null;
    }, COPY_FEEDBACK_MS);
  }

  return (
    <Tooltip.Root
      open={isCopied}
      disabled={!isCopied}
      openDelay={0}
      closeDelay={0}
      positioning={{ placement: "top" }}
    >
      <Tooltip.Trigger asChild>
        <button
          type="button"
          onClick={handleCopy}
          disabled={isCopied}
          aria-label={m.generic_copy()}
          className={clsx(
            "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md p-1 transition-colors",
            "text-foreground-faint hover:bg-overlay/5 hover:text-foreground-muted",
            "active:scale-90 disabled:cursor-default",
            className,
          )}
        >
          {isCopied ? (
            <Check size={iconSize} className="text-success" />
          ) : (
            <Copy size={iconSize} />
          )}
        </button>
      </Tooltip.Trigger>

      <Portal>
        <Tooltip.Positioner>
          <Tooltip.Content
            className={clsx(
              "animate-in fade-in-0 zoom-in-95 z-50",
              "rounded bg-success px-2 py-0.5 text-xs font-semibold tracking-wide whitespace-nowrap text-primary-foreground shadow-lg",
            )}
          >
            {m.generic_copied()}
          </Tooltip.Content>
        </Tooltip.Positioner>
      </Portal>
    </Tooltip.Root>
  );
}
