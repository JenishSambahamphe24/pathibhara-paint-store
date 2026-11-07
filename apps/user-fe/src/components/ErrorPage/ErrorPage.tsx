import { useRouter } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";

import { BUTTON_CLASSES } from "#/components/Button/buttonClasses";
import { SignBoard } from "#/components/SignBoard/SignBoard";

import { ContactHelper } from "#/lib/helpers/contact.helper";

import { useIsOnline } from "#/hooks/useIsOnline";

// When a page's data can't be loaded (the API is down or the phone lost its
// connection). Retrying re-runs the page's loaders.
export function ErrorPage() {
  const router = useRouter();
  const isOnline = useIsOnline();

  return (
    <div className="mx-auto flex max-w-xl flex-col items-start gap-5 px-4 py-16">
      <SignBoard
        variant="notice"
        kicker={isOnline ? "Something went wrong" : "You’re offline"}
        title="We couldn’t load this page"
        as="h1"
      />
      <p className="m-0 text-base text-muted">
        {isOnline
          ? "It’s on our side. Try again in a moment, or ask us on WhatsApp."
          : "Check your connection, then try again."}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void router.invalidate()}
          className={`${BUTTON_CLASSES.primary} min-h-12 text-[22px]`}
        >
          Try again
        </button>
        <a
          href={ContactHelper.whatsappHref()}
          target="_blank"
          rel="noopener noreferrer"
          className={`${BUTTON_CLASSES.whatsapp} min-h-12 text-[22px]`}
        >
          <MessageCircle size={18} aria-hidden="true" />
          Ask the store
        </a>
      </div>
    </div>
  );
}
