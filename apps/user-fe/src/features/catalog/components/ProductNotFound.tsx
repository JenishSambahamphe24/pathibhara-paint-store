import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";

import { BUTTON_CLASSES } from "#/components/Button/buttonClasses";
import { SignBoard } from "#/components/SignBoard/SignBoard";

import { ContactHelper } from "#/lib/helpers/contact.helper";

// A product with no current page and no redirect: renamed and retired, or
// never existed. Old links usually land here from search results or chats.
export function ProductNotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-start gap-5 px-4 py-16">
      <SignBoard
        variant="notice"
        kicker="Not found"
        title="This product isn’t here any more"
        as="h1"
      />
      <p className="m-0 text-base text-muted">
        It may have been renamed or stopped. The same job usually has another
        product in its category.
      </p>
      <div className="flex flex-wrap gap-2">
        <Link
          to="/products"
          className={`${BUTTON_CLASSES.primary} min-h-12 text-[22px]`}
        >
          See all products
        </Link>
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
