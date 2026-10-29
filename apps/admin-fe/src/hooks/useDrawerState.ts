import { useState } from "react";

// Which drawer a page shows, and whether it is open. Closing only flips
// `isOpen`, so the drawer's close animation plays; the page unmounts it in
// `clear`, wired to the drawer's `onExitComplete`.
export function useDrawerState<TValue>() {
  const [value, setValue] = useState<TValue | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  return {
    value,
    isOpen,
    open(next: TValue) {
      setValue(next);
      setIsOpen(true);
    },
    close() {
      setIsOpen(false);
    },
    clear() {
      setValue(null);
    },
  };
}
