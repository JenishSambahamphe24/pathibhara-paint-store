import { BUTTON_CLASSES } from "#/components/Button/buttonClasses";
import { SignBoard } from "#/components/SignBoard/SignBoard";

import { Config } from "#/lib/config";
import { ContactHelper } from "#/lib/helpers/contact.helper";

// Phones: sign, map, details. Desktop: the map on the left, the sign and
// details beside it.
export function VisitStore() {
  const { store } = Config;

  return (
    <section className="grid grid-cols-1 gap-3 px-4 [grid-template-areas:'sign'_'map'_'details'] lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:grid-rows-[auto_1fr] lg:gap-x-8 lg:gap-y-[18px] lg:px-0 lg:[grid-template-areas:'map_sign'_'map_details']">
      <SignBoard
        variant="notice"
        kicker="See the real shade cards"
        title="Visit the store"
        size="lg"
        className="[grid-area:sign] lg:self-start lg:justify-self-start"
      />
      {/* A link until the store's real location can be embedded. */}
      <a
        href={ContactHelper.mapHref()}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-[140px] items-center justify-center rounded-field border border-line bg-surface-2 text-[13px] font-semibold text-accent [grid-area:map] hover:text-accent-hover lg:h-auto lg:min-h-[340px] lg:rounded-card lg:text-sm"
      >
        Open the map
      </a>
      <div className="flex flex-col gap-3 [grid-area:details] lg:gap-[18px]">
        <dl className="m-0 grid grid-cols-[84px_1fr] gap-x-3 gap-y-2 text-[15px] lg:grid-cols-[96px_1fr] lg:gap-x-4 lg:gap-y-2.5 lg:text-[17px]">
          <dt className="text-muted">Address</dt>
          <dd className="m-0">
            {store.address}, {store.city}
          </dd>
          <dt className="text-muted">Open</dt>
          <dd className="m-0">{store.openingHours}</dd>
          <dt className="text-muted">Phone</dt>
          <dd className="m-0 font-semibold">{store.phoneDisplay}</dd>
          <dt className="hidden text-muted lg:block">WhatsApp</dt>
          <dd className="m-0 hidden font-semibold lg:block">
            {store.whatsappDisplay}
          </dd>
        </dl>
        <div className="flex flex-wrap gap-2.5 lg:mt-auto">
          <a
            href={ContactHelper.phoneHref()}
            className={`${BUTTON_CLASSES.primary} hidden min-h-[50px] flex-[1_1_160px] text-[22px] lg:flex`}
          >
            Call the store
          </a>
          <a
            href={ContactHelper.mapHref()}
            target="_blank"
            rel="noopener noreferrer"
            className={`${BUTTON_CLASSES.secondary} min-h-12 flex-[1_1_160px] text-[22px] lg:min-h-[50px]`}
          >
            Get directions
          </a>
        </div>
      </div>
    </section>
  );
}
