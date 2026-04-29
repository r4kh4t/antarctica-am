/**
 * Application-level constants shared across components and modules.
 *
 * Domain-specific constants (model limits, prompt version, etc.) stay
 * co-located with their respective modules in src/lib/llm/ and
 * src/lib/portfolio/ rather than here.
 */

// ---------------------------------------------------------------------------
// AI rationale state
// ---------------------------------------------------------------------------

export const AI_STATUS = {
  LOADING: "loading",
  LOADED: "loaded",
  ERROR: "error",
} as const;

export type AiStatus = (typeof AI_STATUS)[keyof typeof AI_STATUS];

/**
 * Discriminated union representing the lifecycle of the AI rationale fetch.
 * Defined here (not in a component) because it is consumed by multiple
 * components: PortfolioDashboard, RecommendationTable, MethodologyCard.
 */
export type AiState =
  | { status: typeof AI_STATUS.LOADING }
  | {
      status: typeof AI_STATUS.LOADED;
      rationale: Record<string, string>;
      narrative: string;
      sectorInsights: Record<string, string>;
    }
  | { status: typeof AI_STATUS.ERROR };

// ---------------------------------------------------------------------------
// API routes
// ---------------------------------------------------------------------------

export const API_ROUTES = {
  RATIONALE: "/api/rationale",
} as const;
