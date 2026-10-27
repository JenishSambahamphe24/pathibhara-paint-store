export interface IShadeSummary {
  id: string;
  code: string;
  hex: string;
  name: string;
  isActive: boolean;
}

export interface IShadeListItem extends IShadeSummary {
  hasNepali: boolean;
  productId: string | null;
  productName: string | null;
  colourSetCount: number;
  updatedAt: string;
}

export interface IShade {
  id: string;
  code: string;
  hex: string;
  productId: string | null;
  productName: string | null;
  isActive: boolean;
  colourSetCount: number;
  translations: {
    en: { name: string };
    ne: { name: string } | null;
  };
  createdAt: string;
  updatedAt: string;
}
