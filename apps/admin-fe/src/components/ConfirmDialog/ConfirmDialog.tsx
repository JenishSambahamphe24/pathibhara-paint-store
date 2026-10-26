import { Dialog, Portal } from "@ark-ui/react";
import { X } from "lucide-react";

import { Button } from "#/components/Button/Button";

import { m } from "#/paraglide/messages";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  confirmVariant?: "primary" | "danger";
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmLabel,
  confirmVariant = "danger",
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={({ open: isOpen }) => onOpenChange(isOpen)}
      unmountOnExit
    >
      <Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-overlay/40" />
        <Dialog.Positioner className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Dialog.Content className="w-full max-w-sm rounded-xl bg-surface p-5 shadow-xl sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <Dialog.Title className="text-base font-semibold text-foreground">
                {title}
              </Dialog.Title>
              <Dialog.CloseTrigger className="cursor-pointer rounded-md p-1 text-foreground-faint transition-colors hover:bg-surface-subtle hover:text-foreground-muted">
                <X size={18} />
              </Dialog.CloseTrigger>
            </div>

            <Dialog.Description className="text-sm text-foreground-subtle">
              {description}
            </Dialog.Description>

            <div className="mt-5 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                {m.generic_cancel()}
              </Button>
              <Button
                variant={confirmVariant}
                onClick={onConfirm}
                disabled={isLoading}
              >
                {confirmLabel ?? m.generic_confirm()}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
