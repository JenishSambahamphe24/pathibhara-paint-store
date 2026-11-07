import { MessageCircle } from "lucide-react";

import { BUTTON_CLASSES } from "#/components/Button/buttonClasses";
import { SignBoard } from "#/components/SignBoard/SignBoard";
import { StoreMap } from "#/components/StoreMap/StoreMap";

import { Config } from "#/lib/config";
import { ContactHelper } from "#/lib/helpers/contact.helper";

const BRING_WITH_YOU = [
  "Your saved estimate or the WhatsApp message from the site",
  "Shade codes for each part (for example S-0318)",
  "A few photos of the walls, especially damp or cracked spots",
];

// Phones: details, buttons, checklist, then the map. Desktop: details on the
// left, the map sticky on the right.
export function VisitPage() {
  const { store } = Config;
  const details: Array<[string, string, boolean]> = [
    ["Address", `${store.address}, ${store.city}`, true],
    ["Landmark", store.landmark, false],
    ["Parking", store.parking, false],
    ["Phone", store.phoneDisplay, true],
    ["WhatsApp", store.whatsappDisplay, true],
  ];

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-4 px-4 pt-4 pb-6 lg:flex-row lg:flex-wrap lg:items-start lg:gap-10 lg:px-6 lg:pt-7 lg:pb-[72px]">
      <div className="flex min-w-0 flex-col gap-4 lg:flex-[1_1_420px]">
        <SignBoard
          variant="notice"
          kicker="See the real shade cards"
          title="Visit the store"
          as="h1"
          size="lg"
          className="self-start"
        />
        <p className="m-0 text-[17px] leading-normal text-ink-soft">
          Bring your estimate or shade codes and we will match the colours on
          the real shade cards before you buy.
        </p>

        <dl className="m-0 grid grid-cols-[96px_1fr] gap-x-3.5 gap-y-2.5 text-base">
          {details.map(([term, value, isStrong]) => (
            <div key={term} className="contents">
              <dt className="text-muted">{term}</dt>
              <dd className={isStrong ? "m-0 font-semibold" : "m-0"}>
                {value}
              </dd>
            </div>
          ))}
        </dl>

        <table className="w-full border-collapse overflow-hidden rounded-field border border-line bg-surface text-base">
          <caption className="sr-only">Opening hours</caption>
          <tbody>
            {store.hours.map((row) => (
              <tr
                key={row.days}
                className="border-b border-surface-2 last:border-b-0"
              >
                <th scope="row" className="px-3 py-2.5 text-left font-semibold">
                  {row.days}
                </th>
                <td className="px-3 py-2.5 text-right">{row.hours}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(150px,100%),1fr))] gap-2">
          <a
            href={ContactHelper.whatsappHref(
              "Hello, I'd like to visit the store.",
            )}
            target="_blank"
            rel="noopener noreferrer"
            className={`${BUTTON_CLASSES.whatsapp} min-h-[52px] text-[22px]`}
          >
            <MessageCircle size={18} aria-hidden="true" />
            WhatsApp us
          </a>
          <a
            href={ContactHelper.phoneHref()}
            className={`${BUTTON_CLASSES.primary} min-h-[52px] text-[22px]`}
          >
            Call the store
          </a>
          <a
            href={ContactHelper.mapHref()}
            target="_blank"
            rel="noopener noreferrer"
            className={`${BUTTON_CLASSES.secondary} min-h-[52px] text-[22px]`}
          >
            Get directions
          </a>
        </div>

        <div className="flex flex-col gap-1.5 rounded-card border border-line bg-surface px-4 py-3.5">
          <span className="font-display text-[28px] leading-none font-semibold uppercase">
            Bring with you
          </span>
          <ul className="m-0 flex list-disc flex-col gap-1 pl-5 text-base leading-[1.45]">
            {BRING_WITH_YOU.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <StoreMap className="h-[220px] lg:sticky lg:top-4 lg:h-[420px] lg:min-w-0 lg:flex-[1.3_1_520px]" />
    </div>
  );
}
