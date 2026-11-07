import { clsx } from "clsx";
import { MessageCircle } from "lucide-react";

import { ContactHelper } from "#/lib/helpers/contact.helper";

interface WhatsAppLinkProps {
  className?: string;
}

export function WhatsAppLink({ className }: WhatsAppLinkProps) {
  return (
    <a
      href={ContactHelper.whatsappHref()}
      target="_blank"
      rel="noopener noreferrer"
      className={clsx(
        "flex min-h-tap items-center justify-center gap-2 rounded-control bg-success px-4 pt-[3px] font-display text-[22px] leading-none font-semibold tracking-[0.04em] text-on-success uppercase",
        className,
      )}
    >
      <MessageCircle size={18} aria-hidden="true" />
      WhatsApp
    </a>
  );
}
