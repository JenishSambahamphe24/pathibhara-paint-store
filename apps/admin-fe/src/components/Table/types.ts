export type TColumnMaxWidth = "sm" | "md" | "lg" | "xl";

export interface ITableColumnMeta {
  skipTruncate?: boolean;
  maxWidth?: TColumnMaxWidth;
}

export const COLUMN_MAX_WIDTH_CLASSES: Record<TColumnMaxWidth, string> = {
  sm: "max-w-32",
  md: "max-w-48",
  lg: "max-w-64",
  xl: "max-w-96",
};
