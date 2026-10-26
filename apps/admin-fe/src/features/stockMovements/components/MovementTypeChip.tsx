import type { StockMovementType } from "@repo/shared";

import { Chip } from "#/components/Chip/Chip";

import { MovementTypeHelper } from "../helpers/movementType.helper";

interface MovementTypeChipProps {
  type: StockMovementType;
}

const VARIANTS = {
  batchIn: "success",
  batchVoid: "danger",
  sale: "primary",
  saleEdit: "warning",
  adjustment: "neutral",
} as const;

export function MovementTypeChip({ type }: MovementTypeChipProps) {
  return <Chip variant={VARIANTS[type]}>{MovementTypeHelper.label(type)}</Chip>;
}
