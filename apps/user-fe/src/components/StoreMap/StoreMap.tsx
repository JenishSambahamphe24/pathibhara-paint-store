import { clsx } from "clsx";

import { Config } from "#/lib/config";
import { ContactHelper } from "#/lib/helpers/contact.helper";

interface StoreMapProps {
  className?: string;
}

// Google's embedded map once the store has a Maps listing (Config.store
// mapEmbedUrl); until then a plain link, so no empty map is shown.
export function StoreMap({ className }: StoreMapProps) {
  const { mapEmbedUrl, address, city } = Config.store;

  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-card border border-line bg-surface-2",
        className,
      )}
    >
      {mapEmbedUrl ? (
        <iframe
          src={mapEmbedUrl}
          title={`Map of the store, ${address}, ${city}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 size-full border-0"
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-muted">
          {address}, {city}
        </span>
      )}
      <a
        href={ContactHelper.mapHref()}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute right-2.5 bottom-2.5 flex min-h-tap items-center rounded-control border border-line bg-surface px-3.5 pt-[3px] font-display text-xl font-semibold text-ink uppercase"
      >
        Open in Maps
      </a>
    </div>
  );
}
