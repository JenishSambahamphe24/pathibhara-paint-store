import type { ReactNode } from "react";

import { Menu } from "@ark-ui/react";
import { Link } from "@tanstack/react-router";
import clsx from "clsx";

type NavbarDropdownItemLinkProps = {
  to: string;
  onClick?: never;
};

type NavbarDropdownItemButtonProps = {
  onClick: () => void;
  to?: never;
};

type NavbarDropdownItemProps = {
  icon?: ReactNode;
  label: string;
  value: string;
} & (NavbarDropdownItemLinkProps | NavbarDropdownItemButtonProps);

const itemClasses = clsx(
  "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground-muted",
  "cursor-pointer transition-colors hover:bg-surface-subtle focus:ring-0 focus:outline-none",
  "data-highlighted:bg-surface-subtle",
);

export function NavbarDropdownItem({
  icon,
  label,
  value,
  to,
  onClick,
}: NavbarDropdownItemProps) {
  if (to) {
    return (
      <Menu.Item value={value} asChild>
        <Link to={to} className={itemClasses}>
          {icon}
          {label}
        </Link>
      </Menu.Item>
    );
  }

  return (
    <Menu.Item value={value} className={itemClasses} onSelect={onClick}>
      {icon}
      {label}
    </Menu.Item>
  );
}
