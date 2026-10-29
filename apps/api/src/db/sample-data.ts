// SAMPLE DATA: realistic-looking but invented. Names, prices, coverage
// figures, batches and sales exist only to exercise the app; replace them
// before go-live (`pnpm db:reset && pnpm db:migrate && pnpm db:seed`).

export const SAMPLE_NOTE = "Sample data. Replace before go-live.";

export interface ISampleCategory {
  key: string;
  parentKey: string | null;
  slug: string;
  name: string;
}

export interface ISampleVariant {
  volumeMl: number;
  priceRupees: number;
  reorderLevel: number;
}

export interface ISampleProduct {
  key: string;
  categoryKey: string;
  slug: string;
  name: string;
  coverageSqftPerLitre: number;
  defaultCoats: number;
  variants: Array<ISampleVariant>;
}

export const SAMPLE_CATEGORIES: Array<ISampleCategory> = [
  { key: "primer", parentKey: null, slug: "primer", name: "Primer" },
  {
    key: "exteriorPrimer",
    parentKey: "primer",
    slug: "exterior-primer",
    name: "Exterior Primer",
  },
  {
    key: "dampProofPrimer",
    parentKey: "exteriorPrimer",
    slug: "damp-proof-primer",
    name: "Damp-proof Primer",
  },
  {
    key: "normalPrimer",
    parentKey: "exteriorPrimer",
    slug: "normal-primer",
    name: "Normal Primer",
  },
  {
    key: "interiorPrimer",
    parentKey: "primer",
    slug: "interior-primer",
    name: "Interior Primer",
  },
  {
    key: "interiorColour",
    parentKey: null,
    slug: "interior-colour",
    name: "Interior Colour",
  },
  { key: "apexRoyal", parentKey: "interiorColour", slug: "apex-royal", name: "Apex Royal" },
  {
    key: "premiumEmulsion",
    parentKey: "interiorColour",
    slug: "premium-emulsion",
    name: "Premium Emulsion",
  },
  {
    key: "tractorEmulsion",
    parentKey: "interiorColour",
    slug: "tractor-emulsion",
    name: "Tractor Emulsion",
  },
  {
    key: "exteriorColour",
    parentKey: null,
    slug: "exterior-colour",
    name: "Exterior Colour",
  },
  {
    key: "weatherproofEmulsion",
    parentKey: "exteriorColour",
    slug: "weatherproof-emulsion",
    name: "Weatherproof Emulsion",
  },
  { key: "enamel", parentKey: null, slug: "enamel", name: "Enamel" },
  { key: "glossEnamel", parentKey: "enamel", slug: "gloss-enamel", name: "Gloss Enamel" },
];

const STANDARD_SIZES = [1000, 4000, 10000, 20000];

function sizes(prices: Array<number>, reorder: Array<number>, volumes = STANDARD_SIZES) {
  return volumes.map((volumeMl, i) => ({
    volumeMl,
    priceRupees: prices[i],
    reorderLevel: reorder[i],
  }));
}

export const SAMPLE_PRODUCTS: Array<ISampleProduct> = [
  {
    key: "dampProof",
    categoryKey: "dampProofPrimer",
    slug: "damp-proof-primer",
    name: "Damp-proof Primer",
    coverageSqftPerLitre: 12,
    defaultCoats: 1,
    // No 1L size on purpose: the calculator's "least overshoot" path.
    variants: sizes([2450, 5800, 10950], [3, 2, 2], [4000, 10000, 20000]),
  },
  {
    key: "normalPrimer",
    categoryKey: "normalPrimer",
    slug: "exterior-primer-normal",
    name: "Exterior Primer (Normal)",
    coverageSqftPerLitre: 14,
    defaultCoats: 1,
    variants: sizes([420, 1550, 3700, 7100], [10, 5, 3, 2]),
  },
  {
    key: "interiorPrimer",
    categoryKey: "interiorPrimer",
    slug: "interior-primer",
    name: "Interior Primer",
    coverageSqftPerLitre: 16,
    defaultCoats: 1,
    variants: sizes([380, 1400, 3300, 6300], [10, 5, 3, 2]),
  },
  {
    key: "apexRoyal",
    categoryKey: "apexRoyal",
    slug: "apex-royal-luxury-emulsion",
    name: "Apex Royal Luxury Emulsion",
    coverageSqftPerLitre: 35,
    defaultCoats: 2,
    variants: sizes([1050, 3950, 9600, 18800], [6, 4, 2, 2]),
  },
  {
    key: "premiumEmulsion",
    categoryKey: "premiumEmulsion",
    slug: "premium-emulsion",
    name: "Premium Emulsion",
    coverageSqftPerLitre: 28,
    defaultCoats: 2,
    variants: sizes([700, 2650, 6400, 12400], [8, 4, 2, 2]),
  },
  {
    key: "tractorEmulsion",
    categoryKey: "tractorEmulsion",
    slug: "tractor-emulsion",
    name: "Tractor Emulsion",
    coverageSqftPerLitre: 20,
    defaultCoats: 2,
    variants: sizes([450, 1650, 3900, 7500], [12, 6, 3, 2]),
  },
  {
    key: "weatherproof",
    categoryKey: "weatherproofEmulsion",
    slug: "weatherproof-exterior-emulsion",
    name: "Weatherproof Exterior Emulsion",
    coverageSqftPerLitre: 30,
    defaultCoats: 2,
    variants: sizes([980, 3700, 8900, 17400], [6, 4, 2, 2]),
  },
  {
    key: "glossEnamel",
    categoryKey: "glossEnamel",
    slug: "gloss-enamel",
    name: "Gloss Enamel",
    coverageSqftPerLitre: 18,
    defaultCoats: 2,
    variants: sizes([360, 650, 2400], [10, 8, 3], [500, 1000, 4000]),
  },
];

export interface ISampleLine {
  productKey: string;
  volumeMl: number;
  quantity: number;
  unitCostRupees?: number;
}

export interface ISampleBatch {
  receivedOn: string;
  supplierName: string;
  items: Array<ISampleLine>;
}

export const SAMPLE_BATCHES: Array<ISampleBatch> = [
  {
    receivedOn: "2026-10-15",
    supplierName: "Sample Distributor Pvt. Ltd.",
    items: [
      { productKey: "tractorEmulsion", volumeMl: 1000, quantity: 20, unitCostRupees: 380 },
      { productKey: "tractorEmulsion", volumeMl: 4000, quantity: 10, unitCostRupees: 1400 },
      { productKey: "tractorEmulsion", volumeMl: 20000, quantity: 4, unitCostRupees: 6400 },
      { productKey: "apexRoyal", volumeMl: 20000, quantity: 5, unitCostRupees: 16000 },
      { productKey: "apexRoyal", volumeMl: 4000, quantity: 8, unitCostRupees: 3350 },
      { productKey: "interiorPrimer", volumeMl: 10000, quantity: 6, unitCostRupees: 2800 },
      { productKey: "dampProof", volumeMl: 4000, quantity: 6, unitCostRupees: 2050 },
      { productKey: "glossEnamel", volumeMl: 500, quantity: 24, unitCostRupees: 300 },
      { productKey: "glossEnamel", volumeMl: 1000, quantity: 12, unitCostRupees: 545 },
    ],
  },
  {
    receivedOn: "2026-10-20",
    supplierName: "Sample Distributor Pvt. Ltd.",
    items: [
      { productKey: "premiumEmulsion", volumeMl: 1000, quantity: 15 },
      { productKey: "premiumEmulsion", volumeMl: 10000, quantity: 4 },
      { productKey: "weatherproof", volumeMl: 20000, quantity: 3 },
      { productKey: "weatherproof", volumeMl: 4000, quantity: 6 },
      { productKey: "normalPrimer", volumeMl: 4000, quantity: 10 },
      { productKey: "normalPrimer", volumeMl: 20000, quantity: 2 },
      { productKey: "dampProof", volumeMl: 20000, quantity: 3 },
    ],
  },
];

export interface ISampleSale {
  saleDate: string;
  items: Array<ISampleLine>;
}

export const SAMPLE_SALES: Array<ISampleSale> = [
  {
    saleDate: "2026-10-21",
    items: [
      { productKey: "tractorEmulsion", volumeMl: 1000, quantity: 5 },
      { productKey: "tractorEmulsion", volumeMl: 4000, quantity: 2 },
      { productKey: "glossEnamel", volumeMl: 500, quantity: 6 },
    ],
  },
  {
    saleDate: "2026-10-22",
    items: [
      { productKey: "apexRoyal", volumeMl: 20000, quantity: 1 },
      { productKey: "interiorPrimer", volumeMl: 10000, quantity: 2 },
      { productKey: "premiumEmulsion", volumeMl: 1000, quantity: 4 },
    ],
  },
  {
    saleDate: "2026-10-23",
    items: [
      { productKey: "tractorEmulsion", volumeMl: 1000, quantity: 7 },
      { productKey: "weatherproof", volumeMl: 20000, quantity: 1 },
      { productKey: "dampProof", volumeMl: 4000, quantity: 3 },
      { productKey: "glossEnamel", volumeMl: 1000, quantity: 2 },
    ],
  },
];

export const SAMPLE_ADJUSTMENT = {
  productKey: "tractorEmulsion",
  volumeMl: 4000,
  quantityDelta: -1,
  reason: "damaged" as const,
  note: "Dented can (sample data)",
};

export interface ISampleShade {
  key: string;
  code: string;
  hex: string;
  name: string;
  productKey?: string;
}

export const SAMPLE_SHADES: Array<ISampleShade> = [
  {
    key: "ivory",
    code: "SMP-1001",
    hex: "#f3e5c0",
    name: "Ivory Cream",
  },
  { key: "terracotta", code: "SMP-1002", hex: "#c8643b", name: "Terracotta" },
  { key: "brick", code: "SMP-1003", hex: "#8b2f23", name: "Brick Red" },
  { key: "charcoal", code: "SMP-1004", hex: "#333a40", name: "Charcoal" },
  { key: "white", code: "SMP-1005", hex: "#fafaf7", name: "Pure White" },
  { key: "slate", code: "SMP-1006", hex: "#6b7280", name: "Slate Grey" },
  {
    key: "forest",
    code: "SMP-1007",
    hex: "#2f5d3a",
    name: "Forest Green",
    productKey: "weatherproof",
  },
];

export const SAMPLE_COLOUR_SETS = [
  {
    slug: "classic-terracotta",
    name: "Classic Terracotta",
    description: "Warm cream walls with terracotta pillars. Sample data.",
    mainSurface: "ivory",
    columns: "terracotta",
    doorsWindows: "brick",
    roofEdge: "charcoal",
  },
  {
    slug: "modern-slate",
    name: "Modern Slate",
    description: "Crisp white walls with slate and forest accents. Sample data.",
    mainSurface: "white",
    columns: "slate",
    doorsWindows: "charcoal",
    roofEdge: "forest",
  },
];
