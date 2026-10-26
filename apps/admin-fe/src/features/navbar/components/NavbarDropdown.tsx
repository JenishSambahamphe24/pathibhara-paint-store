import { Menu, Portal } from "@ark-ui/react";
import clsx from "clsx";
import { LogOut, User } from "lucide-react";

import { useAuth } from "#/features/auth/hooks/useAuth";
import { m } from "#/paraglide/messages";

import { NavbarDropdownItem } from "./NavbarDropdownItem";

export function NavbarDropdown() {
  const { admin, logout } = useAuth();

  return (
    <Menu.Root positioning={{ placement: "bottom-end" }}>
      <Menu.Trigger
        className={clsx(
          "flex size-9 items-center justify-center rounded-full",
          "bg-surface-inverse-muted text-sm font-medium text-primary-foreground",
          "cursor-pointer shadow-md transition-colors hover:bg-surface-inverse-subtle",
          "focus:ring-0 focus:outline-0",
        )}
      >
        <User size={18} />
      </Menu.Trigger>

      <Portal>
        <Menu.Positioner>
          <Menu.Content
            className={clsx(
              "z-50 min-w-48 rounded-lg border border-border bg-surface p-1 shadow-lg",
              "animate-in fade-in zoom-in-95",
              "focus:ring-0 focus:outline-0",
            )}
          >
            {admin && (
              <>
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-foreground">
                    {admin.name}
                  </p>
                  <p className="text-xs text-foreground-subtle">
                    {admin.email}
                  </p>
                </div>
                <Menu.Separator className="my-1 border-t border-border" />
              </>
            )}

            <NavbarDropdownItem
              value="logout"
              icon={<LogOut size={16} />}
              label={m.navbar_logout()}
              onClick={logout}
            />
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
