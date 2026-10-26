import { Dialog, Portal } from "@ark-ui/react";
import { TriangleAlert } from "lucide-react";

import { Button } from "#/components/Button/Button";

import { m } from "#/paraglide/messages";

interface UnsavedChangesDialogProps {
  open: boolean;
  onDiscard: () => void;
  onCancel: () => void;
}

export function UnsavedChangesDialog({
  open,
  onDiscard,
  onCancel,
}: UnsavedChangesDialogProps) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={({ open: isOpen }) => {
        if (!isOpen) onCancel();
      }}
      unmountOnExit
    >
      <Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-overlay/40" />
        <Dialog.Positioner className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Dialog.Content className="w-full max-w-sm rounded-xl bg-surface p-5 shadow-xl sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-warning-subtle text-warning">
                <TriangleAlert size={18} />
              </div>
              <Dialog.Title className="text-base font-semibold text-foreground">
                {m.unsaved_changes_title()}
              </Dialog.Title>
            </div>

            <Dialog.Description className="text-sm text-foreground-subtle">
              {m.unsaved_changes_description()}
            </Dialog.Description>

            <div className="mt-5 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onCancel}>
                {m.unsaved_changes_stay()}
              </Button>
              <Button variant="danger" onClick={onDiscard}>
                {m.unsaved_changes_discard()}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
