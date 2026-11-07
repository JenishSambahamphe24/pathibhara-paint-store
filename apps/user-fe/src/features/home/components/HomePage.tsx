import type { IPublicProductListItem } from "#/features/catalog/types";
import type { IPublicColourSet } from "#/features/colourSets/types";
import type { IPublicPostListItem } from "#/features/guides/types";

import { useState } from "react";

import { HomeHero } from "./HomeHero";
import { LatestGuides } from "./LatestGuides";
import { ToolLinks } from "./ToolLinks";
import { VisitStore } from "./VisitStore";

interface HomePageProps {
  colourSets: Array<IPublicColourSet>;
  guides: Array<IPublicPostListItem>;
  products: Array<IPublicProductListItem>;
}

export function HomePage({ colourSets, guides, products }: HomePageProps) {
  // Shared by the hero and the tool previews, so both show the same look.
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = colourSets.at(selectedIndex);

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-8 pb-8 lg:gap-[72px] lg:px-6 lg:pb-[72px]">
      <HomeHero
        colourSets={colourSets}
        selected={selected}
        onSelect={setSelectedIndex}
      />
      <ToolLinks colourSet={selected} products={products} />
      {guides.length > 0 && <LatestGuides guides={guides} />}
      <VisitStore />
    </div>
  );
}
