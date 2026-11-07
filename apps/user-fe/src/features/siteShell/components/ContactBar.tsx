import { clsx } from "clsx";
import { MapPin, Phone } from "lucide-react";

import { ContactHelper } from "#/lib/helpers/contact.helper";

import { useIsTyping } from "#/hooks/useIsTyping";

import { WhatsAppLink } from "./WhatsAppLink";

const SECONDARY_ACTION =
  "flex min-h-12 items-center justify-center gap-1.5 rounded-control border border-line pt-[3px] font-display text-[22px] leading-none font-semibold tracking-[0.04em] text-ink uppercase";

// Mobile only. SiteLayout reserves its height at the bottom of the page so it
// never covers content, and it steps aside while the keyboard is open so it
// never covers a field. Below 360px the icons drop so all three labels fit.
export function ContactBar() {
  const isTyping = useIsTyping();

  return (
    <nav
      aria-label="Contact the store"
      className={clsx(
        "fixed inset-x-0 bottom-0 z-30 grid-cols-[1fr_1.6fr_1fr] gap-2 border-t border-line bg-surface px-3 pt-2.5 pb-[calc(14px+env(safe-area-inset-bottom))] lg:hidden max-[359px]:[&_svg]:hidden",
        isTyping ? "hidden" : "grid",
      )}
    >
      <a href={ContactHelper.phoneHref()} className={SECONDARY_ACTION}>
        <Phone size={18} aria-hidden="true" />
        Call
      </a>
      <WhatsAppLink className="min-h-12 px-2" />
      <a
        href={ContactHelper.mapHref()}
        target="_blank"
        rel="noopener noreferrer"
        className={SECONDARY_ACTION}
      >
        <MapPin size={18} aria-hidden="true" />
        Map
      </a>
    </nav>
  );
}
