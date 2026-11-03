import type { IPublicProductListItem } from "#/features/catalog/types";
import type { IPublicColourSet } from "#/features/colourSets/types";
import type { ReactNode } from "react";

import { Link } from "@tanstack/react-router";

import { VISUALIZER_COMPONENTS } from "@repo/shared";

import { CanIcon } from "#/components/CanIcon/CanIcon";
import { SignBoard } from "#/components/SignBoard/SignBoard";

interface ToolLinksProps {
  colourSet: IPublicColourSet | undefined;
  products: Array<IPublicProductListItem>;
}

interface ToolLinkProps {
  to: "/visualizer" | "/calculator" | "/products";
  number: string;
  title: string;
  description: string;
  children: ReactNode;
}

const CAN_SIZES_ML = [1000, 4000, 20000];

function ToolLink({ to, number, title, description, children }: ToolLinkProps) {
  return (
    <Link
      to={to}
      className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-line py-4 text-ink lg:flex lg:flex-col lg:items-stretch lg:gap-3.5 lg:px-6 lg:py-[22px] lg:first:pl-0 lg:last:pr-0 lg:[&:not(:first-child)]:border-l"
    >
      <span className="hidden font-display text-[26px] leading-none text-brand lg:block">
        {number}
      </span>
      <span className="flex flex-col gap-0.5 lg:gap-3.5">
        <span className="font-display text-[28px] leading-[0.95] font-semibold uppercase lg:text-[38px] lg:leading-[0.9]">
          {title}
        </span>
        <span className="text-sm text-muted lg:text-base lg:leading-[1.45] lg:text-ink-soft">
          {description}
        </span>
      </span>
      <span aria-hidden="true" className="flex items-end gap-1 lg:mt-auto">
        {children}
      </span>
    </Link>
  );
}

// Each tool previews itself with the visitor's current pick: the colour set's
// shades, cans banded in its wall colour, and real product photos.
export function ToolLinks({ colourSet, products }: ToolLinksProps) {
  const wallHex = colourSet?.shades.main_surface.hex;
  const withCovers = products.filter((product) => product.coverImage);

  return (
    <section className="flex flex-col gap-2 px-4 lg:gap-5 lg:px-0">
      <SignBoard
        kicker="Three tools"
        title="Decide before you visit"
        size="lg"
        className="lg:self-start"
      />
      <div className="lg:grid lg:grid-cols-[repeat(auto-fit,minmax(320px,1fr))] lg:border-t-2 lg:border-ink">
        <ToolLink
          to="/visualizer"
          number="01"
          title="Colour visualizer"
          description="Turn the house, tap a part, tap a shade. Compare two looks and share them with the family."
        >
          {colourSet &&
            VISUALIZER_COMPONENTS.map((part) => (
              <span
                key={part}
                className="h-10 w-3.5 rounded-[2px] border border-black/10 lg:h-[46px] lg:w-[34px] lg:rounded-[4px]"
                style={{ backgroundColor: colourSet.shades[part].hex }}
              />
            ))}
        </ToolLink>
        <ToolLink
          to="/calculator"
          number="02"
          title="Cost calculator"
          description="Type wall sizes in feet. See litres, the cans to buy and the total in rupees."
        >
          {CAN_SIZES_ML.map((volumeMl) => (
            <CanIcon
              key={volumeMl}
              volumeMl={volumeMl}
              bandHex={wallHex}
              showLabel={false}
            />
          ))}
        </ToolLink>
        <ToolLink
          to="/products"
          number="03"
          title="Products & prices"
          description="Primers, emulsions, enamels and waterproofing, with every size and its price per litre."
        >
          {withCovers.length > 0 ? (
            withCovers
              .slice(0, 2)
              .map((product, index) => (
                <img
                  key={product.slug}
                  src={product.coverImage?.url}
                  alt=""
                  width={64}
                  height={64}
                  loading="lazy"
                  className={
                    index === 0
                      ? "size-11 rounded-lg bg-surface-2 object-cover lg:size-16"
                      : "hidden size-16 rounded-lg bg-surface-2 object-cover lg:block"
                  }
                />
              ))
          ) : (
            <CanIcon volumeMl={4000} bandHex={wallHex} showLabel={false} />
          )}
        </ToolLink>
      </div>
    </section>
  );
}
