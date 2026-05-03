/** Shared filter and sort types used by RecommendationTable and TableControls. */

export type SortKey =
  | "ticker"
  | "sector"
  | "currentWeight"
  | "recommendedWeight"
  | "weightDelta"
  | "riskAdjustedScore";

export type SortDirection = "asc" | "desc";

export type MoveFilter = "all" | "increase" | "reduce" | "hold";
