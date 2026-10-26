import type { ReactNode } from "react";

import { Dialog, Portal } from "@ark-ui/react";
import { X } from "lucide-react";

interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
}

export function Drawer({
  open,
  onOpenChange,
  title,
  description,
  children,
}: DrawerProps) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={({ open: isOpen }) => onOpenChange(isOpen)}
      unmountOnExit
    >
      <Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-overlay/40 data-[state=closed]:animate-overlay-out data-[state=open]:animate-overlay-in" />
        <Dialog.Positioner className="fixed inset-y-0 right-0 z-50 flex">
          <Dialog.Content className="flex h-full w-screen max-w-md flex-col bg-surface shadow-xl data-[state=closed]:animate-drawer-out data-[state=open]:animate-drawer-in">
            <div className="flex items-start justify-between border-b border-border px-5 py-4">
              <div className="min-w-0">
                <Dialog.Title className="truncate text-base font-semibold text-foreground">
                  {title}
                </Dialog.Title>
                {description && (
                  <Dialog.Description className="mt-1 text-sm text-foreground-subtle">
                    {description}
                  </Dialog.Description>
                )}
              </div>
              <Dialog.CloseTrigger className="cursor-pointer rounded-md p-1 text-foreground-faint transition-colors hover:bg-surface-subtle hover:text-foreground-muted">
                <X size={18} />
              </Dialog.CloseTrigger>
            </div>

            <div data-drawer-scroll className="grow overflow-y-auto px-5 py-4">
              {children}
            </div>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
