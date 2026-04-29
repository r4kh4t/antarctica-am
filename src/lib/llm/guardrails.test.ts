import { describe, expect, it } from "vitest";
import { validateRationaleRequest, normalizeRationaleResponse } from "./guardrails";
import type { RationaleResponseShape } from "./schemas";
import type { RecommendationRow } from "@/lib/portfolio/types";

const VALID_ROW: RecommendationRow = {
  assetId: "AAM-LGQ",
  ticker: "AAM-LGQ",
  name: "London Global Quality Equity",
  sector: "Global Equity",
  region: "Global",
  currentWeight: 0.18,
  recommendedWeight: 0.2,
  weightDelta: 0.02,
  averageMonthlyReturn: 0.012,
  annualizedVolatility: 0.08,
  riskAdjustedScore: 1.8,
  rationale: "Strong risk-adjusted score.",
};

const VALID_ROW_2: RecommendationRow = {
  ...VALID_ROW,
  assetId: "AAM-IGC",
  ticker: "AAM-IGC",
  name: "Investment Grade Credit",
  currentWeight: 0.2,
  recommendedWeight: 0.8,
};

const VALID_REQUEST = {
  rows: [VALID_ROW, VALID_ROW_2],
  sectorExposures: [],
  summary: {
    expectedMonthlyReturn: 0.011,
    currentExpectedMonthlyReturn: 0.009,
    expectedAnnualizedVolatility: 0.07,
    turnover: 0.05,
    benchmarkAverageMonthlyReturn: 0.008,
  },
  benchmarkName: "Antarctica Balanced Reference Index",
  asOf: "2026-04",
};

describe("validateRationaleRequest", () => {
  it("accepts a valid request", () => {
    expect(() => validateRationaleRequest(VALID_REQUEST)).not.toThrow();
  });

  it("throws for non-object body", () => {
    expect(() => validateRationaleRequest(null)).toThrow("must be an object");
    expect(() => validateRationaleRequest("string")).toThrow("must be an object");
  });

  it("throws for empty rows array", () => {
    expect(() => validateRationaleRequest({ ...VALID_REQUEST, rows: [] })).toThrow(
      "non-empty array",
    );
  });

  it("throws when currentWeight is out of [0,1]", () => {
    const badRow = { ...VALID_ROW, currentWeight: 1.5 };
    expect(() => validateRationaleRequest({ ...VALID_REQUEST, rows: [badRow] })).toThrow(
      "currentWeight out of range",
    );
  });

  it("throws when recommended weights do not sum to ~1", () => {
    // Both rows have recommendedWeight = 0.2, sum = 0.4 — should fail
    const rows = [
      { ...VALID_ROW, recommendedWeight: 0.2 },
      { ...VALID_ROW_2, recommendedWeight: 0.2 },
    ];
    expect(() => validateRationaleRequest({ ...VALID_REQUEST, rows })).toThrow(
      "Recommended weights sum",
    );
  });
});

describe("normalizeRationaleResponse", () => {
  const rows = [VALID_ROW, VALID_ROW_2];

  const fullResponse: RationaleResponseShape = {
    narrative: "Overall portfolio is well positioned for the coming quarter.",
    rationale: {
      "AAM-LGQ": "Strong momentum and low volatility justify the increase.",
      "AAM-IGC": "Reduced allocation due to lower risk-adjusted score.",
    },
    sectorInsights: {
      "Global Equity": "Global equity sits near the upper bound of its target range.",
    },
  };

  it("passes through AI rationale when present for all assets", () => {
    const result = normalizeRationaleResponse(fullResponse, rows);
    expect(result.rationale["AAM-LGQ"]).toBe(
      "Strong momentum and low volatility justify the increase.",
    );
    expect(result.rationale["AAM-IGC"]).toBe(
      "Reduced allocation due to lower risk-adjusted score.",
    );
  });

  it("falls back to empty string when an asset is missing from the LLM response", () => {
    const partial: RationaleResponseShape = {
      ...fullResponse,
      rationale: { "AAM-LGQ": "Strong performer." },
    };
    const result = normalizeRationaleResponse(partial, rows);
    expect(result.rationale["AAM-IGC"]).toBe("");
  });

  it("trims whitespace from narrative and rationale", () => {
    const padded: RationaleResponseShape = {
      ...fullResponse,
      narrative: "  Overall well positioned.  ",
      rationale: { "AAM-LGQ": "  Strong.  ", "AAM-IGC": " Reduced.  " },
    };
    const result = normalizeRationaleResponse(padded, rows);
    expect(result.narrative).toBe("Overall well positioned.");
    expect(result.rationale["AAM-LGQ"]).toBe("Strong.");
  });

  it("returns empty sectorInsights when not provided", () => {
    const noInsights: RationaleResponseShape = {
      ...fullResponse,
      sectorInsights: undefined,
    };
    const result = normalizeRationaleResponse(noInsights, rows);
    expect(result.sectorInsights).toEqual({});
  });
});
