import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { Wordmark } from "#/components/Wordmark/Wordmark";

import { NAV_ITEMS } from "../navItems";
import { ThemeToggle } from "./ThemeToggle";
import { WhatsAppLink } from "./WhatsAppLink";

const MOBILE_MENU_ID = "mobile-menu";

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <header>
      <div className="bg-sign-red p-[5px] lg:hidden">
        <div className="flex items-center justify-between rounded-sign-inner border-2 border-pinstripe py-1 pr-1 pl-3">
          <Link
            to="/"
            aria-label="Pathibhara Paints, home"
            className="flex min-h-tap items-center"
            onClick={closeMenu}
          >
            <Wordmark framed={false} />
          </Link>
          <div className="flex gap-0.5">
            <ThemeToggle tone="sign" />
            <button
              type="button"
              aria-label={isMenuOpen ? "Close menu" : "Menu"}
              aria-expanded={isMenuOpen}
              aria-controls={MOBILE_MENU_ID}
              onClick={() => setIsMenuOpen((open) => !open)}
              className="flex size-tap items-center justify-center text-sign-cream"
            >
              {isMenuOpen ? (
                <X size={22} aria-hidden="true" />
              ) : (
                <Menu size={22} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <nav
          id={MOBILE_MENU_ID}
          aria-label="Main"
          className="border-b border-line bg-surface lg:hidden"
          onKeyDown={(event) => event.key === "Escape" && closeMenu()}
        >
          <ul className="m-0 list-none p-0">
            {NAV_ITEMS.map((item) => (
              <li
                key={item.to}
                className="border-b border-line last:border-b-0"
              >
                <Link
                  to={item.to}
                  onClick={closeMenu}
                  className="flex min-h-12 items-center px-4 pt-1 font-display text-[26px] leading-none font-semibold uppercase"
                  activeProps={{ className: "text-brand" }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="hidden border-b border-line bg-bg lg:block">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-3 px-6 py-2.5">
          <Link to="/" aria-label="Pathibhara Paints, home" className="block">
            <Wordmark />
          </Link>
          <nav aria-label="Main">
            <ul className="m-0 flex list-none flex-wrap gap-1 p-0 font-display text-[23px] font-medium uppercase">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="flex min-h-tap items-center px-3 pt-[3px] text-ink"
                    activeProps={{
                      className:
                        "underline decoration-2 underline-offset-[5px]",
                    }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle tone="plain" />
            <WhatsAppLink />
          </div>
        </div>
      </div>
    </header>
  );
}
