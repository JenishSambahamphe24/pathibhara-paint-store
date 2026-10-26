import { useBlocker } from "@tanstack/react-router";
import { useCallback, useState } from "react";

interface IUseUnsavedChangesOptions {
  isDirty: boolean;
}

export function useUnsavedChanges({ isDirty }: IUseUnsavedChangesOptions) {
  const [pendingClose, setPendingClose] = useState(false);

  const blocker = useBlocker({
    shouldBlockFn: () => isDirty,
    enableBeforeUnload: () => isDirty,
    withResolver: true,
  });

  const isBlocked = blocker.status === "blocked" || pendingClose;

  const proceed = useCallback(() => {
    if (blocker.status === "blocked") {
      blocker.proceed();
    }
    setPendingClose(false);
  }, [blocker]);

  const reset = useCallback(() => {
    if (blocker.status === "blocked") {
      blocker.reset();
    }
    setPendingClose(false);
  }, [blocker]);

  function guardClose(onClose: () => void) {
    if (isDirty) {
      setPendingClose(true);
      return;
    }
    onClose();
  }

  return { isBlocked, proceed, reset, guardClose };
}
