import { Menu } from "lucide-react";

import { m } from "#/paraglide/messages";

interface MobileMenuButtonProps {
  onClick: () => void;
}

export function MobileMenuButton({ onClick }: MobileMenuButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={m.sidebar_open_menu()}
      className="cursor-pointer rounded-md p-2 text-primary-foreground transition-colors hover:bg-primary-foreground/10 lg:hidden"
    >
      <Menu size={22} />
    </button>
  );
}
