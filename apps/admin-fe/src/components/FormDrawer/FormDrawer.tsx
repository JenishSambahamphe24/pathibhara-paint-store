import type { ReactNode } from "react";

import { Drawer } from "#/components/Drawer/Drawer";
import { UnsavedChangesDialog } from "#/components/UnsavedChangesDialog/UnsavedChangesDialog";

import { useUnsavedChanges } from "#/hooks/useUnsavedChanges";

interface FormDrawerProps {
  open: boolean;
  /** Closing with unsaved edits asks before discarding them. */
  isDirty: boolean;
  title: string;
  size?: "md" | "xl";
  onClose: () => void;
  onExitComplete: () => void;
  children: ReactNode;
}

// One dialog for the drawer's whole life, loading state included, rather than
// a loading drawer swapped for the form's own.
export function FormDrawer({
  open,
  isDirty,
  title,
  size = "md",
  onClose,
  onExitComplete,
  children,
}: FormDrawerProps) {
  const { isBlocked, proceed, reset, guardClose } = useUnsavedChanges({
    isDirty,
  });
  return (
    <>
      <Drawer
        open={open}
        onOpenChange={(next) => !next && guardClose(onClose)}
        onExitComplete={onExitComplete}
        title={title}
        size={size}
      >
        {children}
      </Drawer>
      <UnsavedChangesDialog
        open={isBlocked}
        onDiscard={() => {
          proceed();
          onClose();
        }}
        onCancel={reset}
      />
    </>
  );
}
