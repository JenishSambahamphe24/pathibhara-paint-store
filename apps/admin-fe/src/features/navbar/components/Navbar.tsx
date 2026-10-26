import { MobileMenuButton } from "./MobileMenuButton";
import { NavbarDropdown } from "./NavbarDropdown";

interface NavbarProps {
  onOpenSidebar: () => void;
}

export function Navbar({ onOpenSidebar }: NavbarProps) {
  return (
    <div className="sticky top-0 flex h-18 items-center gap-3 border-b border-b-primary-foreground/20 bg-primary px-4 py-2 text-primary-foreground shadow-md">
      <MobileMenuButton onClick={onOpenSidebar} />

      <div className="ml-auto flex shrink-0 items-center gap-3">
        <NavbarDropdown />
      </div>
    </div>
  );
}
