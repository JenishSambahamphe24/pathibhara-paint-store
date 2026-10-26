import { Toaster as ArkToaster, Toast } from "@ark-ui/react/toast";
import clsx from "clsx";
import { AlertTriangle, CheckCircle, Info, X, XCircle } from "lucide-react";

import { toaster } from "#/lib/toaster";

const typeConfig = {
  success: {
    icon: CheckCircle,
    className: "border-success-border bg-success-subtle text-success-strong",
  },
  error: {
    icon: XCircle,
    className: "border-danger-border bg-danger-subtle text-danger-strong",
  },
  warning: {
    icon: AlertTriangle,
    className: "border-warning-border bg-warning-subtle text-warning-strong",
  },
  info: {
    icon: Info,
    className: "border-info-border bg-info-subtle text-info-strong",
  },
} as const;

function resolveConfig(type: string | undefined) {
  switch (type) {
    case "success":
      return typeConfig.success;
    case "error":
      return typeConfig.error;
    case "warning":
      return typeConfig.warning;
    default:
      return typeConfig.info;
  }
}

export function AppToaster() {
  return (
    // Above the dialogs (backdrop z-40, positioner z-50) — a mutation fired
    // from a confirm dialog toasts while that dialog is still open, and the
    // portalled dialog outranks the toaster on DOM order alone.
    <ArkToaster toaster={toaster} className="z-60">
      {(toast) => {
        const config = resolveConfig(toast.type);
        const Icon = config.icon;

        return (
          <Toast.Root
            key={toast.id}
            className={clsx(
              "flex max-w-sm min-w-64 items-start gap-3 rounded-lg border px-4 py-3 shadow-md",
              config.className,
            )}
          >
            <Icon size={18} className="mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              {toast.title && (
                <Toast.Title className="text-sm font-semibold">
                  {toast.title}
                </Toast.Title>
              )}
              {toast.description && (
                <Toast.Description className="text-sm opacity-80">
                  {toast.description}
                </Toast.Description>
              )}
            </div>
            <Toast.CloseTrigger className="shrink-0 cursor-pointer opacity-60 transition-opacity hover:opacity-100">
              <X size={16} />
            </Toast.CloseTrigger>
          </Toast.Root>
        );
      }}
    </ArkToaster>
  );
}
