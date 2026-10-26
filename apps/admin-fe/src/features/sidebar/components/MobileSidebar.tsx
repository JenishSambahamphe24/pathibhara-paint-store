import { Dialog, Portal } from "@ark-ui/react";
import { useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";

import { Sidebar } from "./Sidebar";

interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    onOpenChange(false);
  }, [pathname, onOpenChange]);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={({ open: isOpen }) => onOpenChange(isOpen)}
      unmountOnExit
    >
      <Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-overlay/40 data-[state=closed]:animate-overlay-out data-[state=open]:animate-overlay-in lg:hidden" />
        <Dialog.Positioner className="fixed inset-y-0 left-0 z-50 flex lg:hidden">
          <Dialog.Content className="h-full data-[state=closed]:animate-sidebar-out data-[state=open]:animate-sidebar-in">
            <Sidebar />
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
