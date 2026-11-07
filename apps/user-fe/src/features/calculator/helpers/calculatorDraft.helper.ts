import type {
  IAreaRow,
  IEstimateResult,
  IProductRow,
  ISectionDraft,
  TPresetId,
  TSectionKey,
} from "../types";
import type { CostEstimateInput } from "@repo/shared";
import type { IPublicProductListItem } from "#/features/catalog/types";

import { AreaMath, estimateSectionSchema, VolumeHelper } from "@repo/shared";

import { CurrencyHelper } from "#/lib/helpers/currency.helper";
import { NumberHelper } from "#/lib/helpers/number.helper";

type TRowSeed = [
  label: string,
  width: number,
  height: number,
  quantity: number,
];

interface IPresetSeed {
  surfaces: Array<TRowSeed>;
  deductions: Array<TRowSeed>;
}

const SECTION_NAMES: Record<TSectionKey, string> = {
  interior: "Interior",
  exterior: "Exterior",
};

const PRESET_SEEDS: Record<TSectionKey, IPresetSeed> = {
  interior: {
    surfaces: [
      ["Long walls", 12, 10, 2],
      ["Short walls", 10, 10, 2],
      ["Ceiling", 12, 10, 1],
    ],
    deductions: [
      ["Door", 3, 7, 1],
      ["Windows", 4, 4, 2],
    ],
  },
  exterior: {
    surfaces: [
      ["Front & back", 30, 11, 2],
      ["Sides", 25, 11, 2],
      ["Parapet", 110, 3, 1],
    ],
    deductions: [
      ["Doors", 3.5, 7, 2],
      ["Windows", 4, 4, 6],
    ],
  },
};

export type TSectionProblems = Partial<Record<TSectionKey, string>>;

export interface IDraftInput {
  // Null until at least one section has a sized wall and a product.
  input: CostEstimateInput | null;
  // Why a section that has walls is left out of the estimate.
  problems: TSectionProblems;
}

export class CalculatorDraftHelper {
  // Ids from a counter rather than random, so the server render and the
  // browser build the same preset.
  static preset(
    id: TPresetId,
    products: ReadonlyArray<IPublicProductListItem>,
    startWith: ReadonlyArray<IPublicProductListItem> = [],
  ): Array<ISectionDraft> {
    let next = 0;
    const newId = () => `r${next++}`;
    const rows = (seeds: Array<TRowSeed>): Array<IAreaRow> =>
      seeds.map(([label, width, height, quantity]) => ({
        id: newId(),
        label,
        width: String(width),
        height: String(height),
        quantity,
      }));
    const productRows = (
      picked: ReadonlyArray<IPublicProductListItem>,
    ): Array<IProductRow> =>
      picked.map((product) => ({
        id: newId(),
        productId: product.id,
        coats: product.defaultCoats,
      }));

    const section = (key: TSectionKey, isOn: boolean): ISectionDraft => {
      const isBlank = id === "blank";
      const picked =
        key === "exterior" && startWith.length > 0
          ? startWith
          : CalculatorDraftHelper.defaultProducts(products, key);
      return {
        key,
        name: SECTION_NAMES[key],
        isOn,
        surfaces: isBlank ? [] : rows(PRESET_SEEDS[key].surfaces),
        deductions: isBlank ? [] : rows(PRESET_SEEDS[key].deductions),
        products: productRows(isBlank ? picked.slice(-1) : picked),
      };
    };

    return [
      section("interior", id !== "exterior"),
      section("exterior", id === "exterior"),
    ];
  }

  // A primer and a finish suited to the section, judged from product and
  // category names. A guess the visitor can change; when the catalogue has
  // neither, the first product stands in.
  static defaultProducts(
    products: ReadonlyArray<IPublicProductListItem>,
    key: TSectionKey,
  ): Array<IPublicProductListItem> {
    const text = (product: IPublicProductListItem) =>
      `${product.name} ${product.category.name}`.toLowerCase();
    const isPrimer = (product: IPublicProductListItem) =>
      text(product).includes("primer");
    const suits = (product: IPublicProductListItem) =>
      text(product).includes(key);
    const best = (candidates: Array<IPublicProductListItem>) =>
      candidates.find(suits) ?? candidates[0];

    const primer = best(products.filter(isPrimer));
    const finish = best(products.filter((product) => !isPrimer(product)));
    const picked = [primer, finish].filter(
      (product): product is IPublicProductListItem => Boolean(product),
    );
    return picked.length > 0 ? picked : products.slice(0, 1);
  }

  // A size the visitor typed, or 0 when it isn't a positive number yet.
  static feet(value: string): number {
    const parsed = Number(value.trim().replace(",", "."));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }

  static isSized(row: IAreaRow): boolean {
    return (
      CalculatorDraftHelper.feet(row.width) > 0 &&
      CalculatorDraftHelper.feet(row.height) > 0
    );
  }

  static area(rows: ReadonlyArray<IAreaRow>): number {
    return AreaMath.total(
      rows.filter(CalculatorDraftHelper.isSized).map((row) => ({
        widthFt: CalculatorDraftHelper.feet(row.width),
        heightFt: CalculatorDraftHelper.feet(row.height),
        quantity: row.quantity,
      })),
    );
  }

  static netArea(section: ISectionDraft): number {
    return Math.max(
      0,
      CalculatorDraftHelper.area(section.surfaces) -
        CalculatorDraftHelper.area(section.deductions),
    );
  }

  // Rows still being typed are skipped rather than failing the estimate;
  // the same shared schema as the API decides what's sendable.
  static toInput(
    sections: ReadonlyArray<ISectionDraft>,
    wastagePercent: number,
  ): IDraftInput {
    const problems: TSectionProblems = {};
    const ready: CostEstimateInput["sections"] = [];

    for (const section of sections) {
      if (!section.isOn) continue;
      const toItem = (row: IAreaRow) => ({
        label: row.label.trim() || null,
        widthFt: CalculatorDraftHelper.feet(row.width),
        heightFt: CalculatorDraftHelper.feet(row.height),
        quantity: row.quantity,
      });
      const surfaces = section.surfaces
        .filter(CalculatorDraftHelper.isSized)
        .map(toItem);
      if (surfaces.length === 0) continue;

      const candidate = {
        name: section.name,
        surfaces,
        deductions: section.deductions
          .filter(CalculatorDraftHelper.isSized)
          .map(toItem),
        products: section.products
          .filter((row) => row.productId)
          .map((row) => ({ productId: row.productId, coats: row.coats })),
      };
      const parsed = estimateSectionSchema.safeParse(candidate);
      if (parsed.success) ready.push(candidate);
      else problems[section.key] = parsed.error.issues[0]?.message;
    }

    return {
      input: ready.length > 0 ? { wastagePercent, sections: ready } : null,
      problems,
    };
  }

  // Pre-written for WhatsApp, so the store sees the whole estimate.
  static summary(result: IEstimateResult, url: string): string {
    const lines = ["Hello, here is my paint estimate:"];
    for (const section of result.sections) {
      lines.push(
        "",
        `${section.name}: ${CalculatorDraftHelper.sqft(section.netAreaSqft)} to paint`,
      );
      for (const product of section.products) {
        const cans = product.containers
          .map((can) => `${can.count} × ${VolumeHelper.label(can.volumeMl)}`)
          .join(" + ");
        lines.push(
          `- ${product.name}, ${product.coats} ${product.coats === 1 ? "coat" : "coats"}: ${cans} (${CurrencyHelper.formatNpr(product.costPaisa)})`,
        );
      }
    }
    lines.push(
      "",
      `Total: ${CurrencyHelper.formatNpr(result.totalPaisa)}`,
      url,
    );
    return lines.join("\n");
  }

  // For when the estimate can't be priced: every wall and opening as typed,
  // so the store can work it out by hand.
  static wallsMessage(sections: ReadonlyArray<ISectionDraft>): string {
    const lines = ["Hello, please work out the paint for these walls:"];
    const describe = (row: IAreaRow) =>
      `- ${row.label.trim() || "Unnamed"}: ${row.width} × ${row.height} ft × ${row.quantity}`;
    for (const section of sections) {
      if (!section.isOn) continue;
      const sized = section.surfaces.filter(CalculatorDraftHelper.isSized);
      if (sized.length === 0) continue;
      lines.push("", `${section.name} walls:`, ...sized.map(describe));
      const openings = section.deductions.filter(CalculatorDraftHelper.isSized);
      if (openings.length > 0) {
        lines.push("Doors and windows:", ...openings.map(describe));
      }
    }
    return lines.join("\n");
  }

  // "1,180 sq ft", whole feet with lakh grouping.
  static sqft(value: number): string {
    return `${NumberHelper.grouped(Math.round(value))} sq ft`;
  }

  // "33.7 L" for a readout; the API's ml stay integers until this point.
  static litres(ml: number): string {
    return `${(Math.round(ml / 100) / 10).toFixed(1)} L`;
  }
}
