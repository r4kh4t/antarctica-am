import type { RecommendationRow, SectorExposure } from "@/lib/portfolio/types";
import type { RationaleResponseShape } from "./schemas";

/** Thrown when the incoming request payload fails business validation. */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export type RationaleRequest = {
  rows: RecommendationRow[];
  sectorExposures: SectorExposure[];
  summary: {
    expectedMonthlyReturn: number;
    currentExpectedMonthlyReturn: number;
    expectedAnnualizedVolatility: number;
    turnover: number;
    benchmarkAverageMonthlyReturn: number;
  };
  benchmarkName: string;
  asOf: string;
};

export type NormalizedRationaleResponse = {
  narrative: string;
  rationale: Record<string, string>;
  sectorInsights: Record<string, string>;
};

/**
 * Validates the incoming API request body shape and business constraints.
 * Structural validation of the LLM *response* is handled by Zod via Instructor.
 */
export function validateRationaleRequest(body: unknown): RationaleRequest {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Request body must be an object.");
  }

  const req = body as RationaleRequest;

  if (!Array.isArray(req.rows) || req.rows.length === 0) {
    throw new ValidationError("rows must be a non-empty array.");
  }

  for (const row of req.rows) {
    if (typeof row.assetId !== "string") {
      throw new ValidationError("Each row must have a string assetId.");
    }
    if (typeof row.currentWeight !== "number" || row.currentWeight < 0 || row.currentWeight > 1) {
      throw new ValidationError(`currentWeight out of range for ${row.assetId}.`);
    }
    if (
      typeof row.recommendedWeight !== "number" ||
      row.recommendedWeight < 0 ||
      row.recommendedWeight > 1
    ) {
      throw new ValidationError(`recommendedWeight out of range for ${row.assetId}.`);
    }
  }

  const weightSum = req.rows.reduce((sum, row) => sum + row.recommendedWeight, 0);
  if (Math.abs(weightSum - 1) > 0.01) {
    throw new ValidationError(`Recommended weights sum to ${weightSum.toFixed(4)}, expected ~1.`);
  }

  return req;
}

/**
 * Normalises the Instructor/Zod-validated response for the UI.
 *
 * Zod already guarantees the shape is correct (narrative, rationale, sectorInsights).
 * This step ensures every row in the request has a rationale entry — assets the LLM
 * skipped get an empty string, which causes the UI to fall back to algorithmic rationale.
 */
export function normalizeRationaleResponse(
  raw: RationaleResponseShape,
  rows: RecommendationRow[],
): NormalizedRationaleResponse {
  const rationale: Record<string, string> = {};

  for (const row of rows) {
    const aiText = raw.rationale[row.assetId];
    rationale[row.assetId] =
      typeof aiText === "string" && aiText.trim().length > 0 ? aiText.trim() : "";
  }

  return {
    narrative: raw.narrative.trim(),
    rationale,
    sectorInsights: raw.sectorInsights ?? {},
  };
}
