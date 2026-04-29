import type { RecommendationRow, SectorExposure } from "@/lib/portfolio/types";

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

export type RationaleResponse = {
  narrative: string;
  rationale: Record<string, string>;
  sectorInsights: Record<string, string>;
  model: string;
  promptVersion: string;
  tokensUsed: number;
};

/** Validates the incoming API request body. */
export function validateRationaleRequest(body: unknown): RationaleRequest {
  if (!body || typeof body !== "object") {
    throw new Error("Request body must be an object.");
  }

  const req = body as RationaleRequest;

  if (!Array.isArray(req.rows) || req.rows.length === 0) {
    throw new Error("rows must be a non-empty array.");
  }

  for (const row of req.rows) {
    if (typeof row.assetId !== "string") throw new Error("Each row must have a string assetId.");
    if (typeof row.currentWeight !== "number" || row.currentWeight < 0 || row.currentWeight > 1) {
      throw new Error(`currentWeight out of range for ${row.assetId}`);
    }
    if (
      typeof row.recommendedWeight !== "number" ||
      row.recommendedWeight < 0 ||
      row.recommendedWeight > 1
    ) {
      throw new Error(`recommendedWeight out of range for ${row.assetId}`);
    }
  }

  const weightSum = req.rows.reduce((sum, row) => sum + row.recommendedWeight, 0);

  if (Math.abs(weightSum - 1) > 0.01) {
    throw new Error(`Recommended weights sum to ${weightSum.toFixed(4)}, expected ~1.`);
  }

  return req;
}

/** Validates and normalises the LLM's JSON output. */
export function validateRationaleResponse(
  raw: unknown,
  rows: RecommendationRow[],
): Pick<RationaleResponse, "narrative" | "rationale" | "sectorInsights"> {
  if (!raw || typeof raw !== "object") {
    throw new Error("LLM response is not an object.");
  }

  const obj = raw as Record<string, unknown>;

  if (typeof obj["narrative"] !== "string" || obj["narrative"].trim().length < 10) {
    throw new Error("LLM response missing valid narrative.");
  }

  if (!obj["rationale"] || typeof obj["rationale"] !== "object") {
    throw new Error("LLM response missing rationale object.");
  }

  const rawRationale = obj["rationale"] as Record<string, unknown>;

  // Use empty string for missing assets — the UI will fall back to algorithmic rationale
  const rationale: Record<string, string> = {};
  for (const row of rows) {
    const value = rawRationale[row.assetId];
    rationale[row.assetId] =
      typeof value === "string" && value.trim().length > 0 ? value.trim() : "";
  }

  // Sector insights are optional — gracefully accept partial or missing data
  const sectorInsights: Record<string, string> = {};
  const rawSectorInsights = obj["sectorInsights"];
  if (rawSectorInsights && typeof rawSectorInsights === "object") {
    for (const [sector, insight] of Object.entries(rawSectorInsights)) {
      if (typeof insight === "string" && insight.trim().length > 0) {
        sectorInsights[sector] = insight.trim();
      }
    }
  }

  return {
    narrative: (obj["narrative"] as string).trim(),
    rationale,
    sectorInsights,
  };
}
