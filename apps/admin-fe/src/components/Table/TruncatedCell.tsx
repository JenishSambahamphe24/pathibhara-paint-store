import type { TColumnMaxWidth } from "./types";
import type { ReactNode } from "react";

import { Portal, Tooltip } from "@ark-ui/react";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

import { CopyButton } from "#/components/CopyButton/CopyButton";

import { COLUMN_MAX_WIDTH_CLASSES } from "./types";

interface TruncatedCellProps {
  children: ReactNode;
  maxWidth?: TColumnMaxWidth;
}

export function TruncatedCell({
  children,
  maxWidth = "lg",
}: TruncatedCellProps) {
  const cellRef = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const el = cellRef.current;
    if (!el) return;

    function check() {
      if (!el) return;
      setIsTruncated(el.scrollWidth > el.clientWidth);
    }

    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [children]);

  return (
    <div className="flex min-w-0 items-center gap-1">
      <Tooltip.Root
        openDelay={500}
        closeDelay={0}
        disabled={!isTruncated}
        positioning={{ placement: "top" }}
      >
        <Tooltip.Trigger asChild>
          <span
            ref={cellRef}
            className={clsx(
              "block min-w-0 truncate",
              COLUMN_MAX_WIDTH_CLASSES[maxWidth],
            )}
          >
            {children}
          </span>
        </Tooltip.Trigger>

        <Portal>
          <Tooltip.Positioner>
            <Tooltip.Content
              className={clsx(
                "z-50 max-w-96 rounded-lg border border-border bg-surface px-3 py-2",
                "text-sm text-foreground-muted shadow-lg",
                "animate-in fade-in-0 zoom-in-95",
              )}
            >
              {children}
            </Tooltip.Content>
          </Tooltip.Positioner>
        </Portal>
      </Tooltip.Root>

      {isTruncated && (
        <CopyButton
          getContent={() => cellRef.current?.textContent ?? ""}
          iconSize={14}
        />
      )}
    </div>
  );
}
