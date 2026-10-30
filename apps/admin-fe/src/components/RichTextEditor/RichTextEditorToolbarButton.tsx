import type { ReactNode } from "react";

import clsx from "clsx";

interface RichTextEditorToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: ReactNode;
}

export function RichTextEditorToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: RichTextEditorToolbarButtonProps) {
  return (
    <button
      type="button"
      // Keeps the editor focused, so its selection and pending marks survive the click.
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={clsx(
        "inline-flex cursor-pointer items-center justify-center rounded-md p-1.5 text-foreground-muted transition-colors",
        "hover:bg-surface-subtle hover:text-foreground",
        "disabled:cursor-not-allowed disabled:opacity-50",
        active && "bg-info-subtle text-info-strong hover:bg-info-subtle",
      )}
    >
      {children}
    </button>
  );
}
