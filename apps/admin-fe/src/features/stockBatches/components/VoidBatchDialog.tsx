import { Dialog, Portal } from "@ark-ui/react";
import { useState } from "react";

import { Button } from "#/components/Button/Button";

import { ApiErrorHelper } from "#/lib/helpers/apiError.helper";
import { m } from "#/paraglide/messages";

import { useVoidBatch } from "../hooks/useVoidBatch";

interface VoidBatchDialogProps {
  batchId: string;
  batchNumber: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VoidBatchDialog({
  batchId,
  batchNumber,
  open,
  onOpenChange,
}: VoidBatchDialogProps) {
  const [reason, setReason] = useState("");
  const mutation = useVoidBatch(batchId);
  const error = mutation.error ? ApiErrorHelper.describe(mutation.error) : null;

  function close(next: boolean) {
    if (!next) {
      setReason("");
      mutation.reset();
    }
    onOpenChange(next);
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={({ open: next }) => close(next)}
      unmountOnExit
    >
      <Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-overlay/40" />
        <Dialog.Positioner className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Dialog.Content className="w-full max-w-md space-y-4 rounded-xl bg-surface p-6 shadow-xl">
            <Dialog.Title className="text-base font-semibold text-foreground">
              {m.batches_void_title({ number: batchNumber })}
            </Dialog.Title>
            <Dialog.Description className="text-sm text-foreground-subtle">
              {m.batches_void_description()}
            </Dialog.Description>
            <label className="block space-y-1">
              <span className="text-sm font-medium text-foreground-muted">
                {m.batches_void_reason()}
                <span className="ml-0.5 text-danger">*</span>
              </span>
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                rows={3}
                className="w-full rounded-lg border border-border-strong px-3 py-2 text-sm text-foreground focus:border-foreground focus:ring-2 focus:ring-foreground/10 focus:outline-none"
              />
            </label>
            {error && (
              <p className="rounded-lg bg-danger-subtle px-3 py-2 text-sm text-danger-strong">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => close(false)}
                disabled={mutation.isPending}
              >
                {m.generic_cancel()}
              </Button>
              <Button
                variant="danger"
                disabled={mutation.isPending || reason.trim() === ""}
                onClick={() =>
                  mutation.mutate(reason.trim(), {
                    onSuccess: () => close(false),
                  })
                }
              >
                {m.batches_void_confirm()}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
