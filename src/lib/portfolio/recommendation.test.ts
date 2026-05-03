import { describe, expect, it } from "vitest";
import { applyPortfolioConstraints, calculateTurnover, getSectorExposures } from "./constraints";
import { getPortfolioData } from "./data";
import { calculateAssetMonthlyReturns } from "./monthlyReturns";
import { buildPortfolioRecommendation } from "./recommendation";
import type { Asset, Constraints, PricePoint } from "./types";

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

describe("monthly return calculation", () => {
  it("includes a partial first-month return and uses the final available daily price in each month", () => {
    const prices: PricePoint[] = [
      { assetId: "A", date: "2025-01-02", close: 100 },
      { assetId: "A", date: "2025-01-31", close: 110 },
      { assetId: "A", date: "2025-02-03", close: 120 },
      { assetId: "A", date: "2025-02-28", close: 121 },
      { assetId: "A", date: "2025-03-31", close: 115 },
    ];

    const returns = calculateAssetMonthlyReturns(prices);

    // Partial first month (Jan 2 → Jan 31) + full Feb + full Mar
    expect(returns).toHaveLength(3);
    expect(returns[0]).toMatchObject({ assetId: "A", month: "2025-01" });
    expect(returns[0]?.return).toBeCloseTo(110 / 100 - 1, 8);
    expect(returns[1]).toMatchObject({ assetId: "A", month: "2025-02" });
    expect(returns[1]?.return).toBeCloseTo(121 / 110 - 1, 8);
    expect(returns[2]).toMatchObject({ assetId: "A", month: "2025-03" });
    expect(returns[2]?.return).toBeCloseTo(115 / 121 - 1, 8);
  });

  it("returns no monthly returns for a single data point exactly at month end", () => {
    // Single row that IS the month end — no intra-month baseline to anchor against.
    expect(
      calculateAssetMonthlyReturns([{ assetId: "A", date: "2025-01-31", close: 100 }]),
    ).toEqual([]);
  });

  it("records a partial first-month return when there are two observations in the same month", () => {
    const returns = calculateAssetMonthlyReturns([
      { assetId: "A", date: "2025-01-02", close: 100 },
      { assetId: "A", date: "2025-01-20", close: 110 },
    ]);

    expect(returns).toHaveLength(1);
    expect(returns[0]).toMatchObject({ assetId: "A", month: "2025-01" });
    expect(returns[0]?.return).toBeCloseTo(0.1, 8);
  });
});

describe("portfolio constraints", () => {
  const assets: Asset[] = [
    {
      assetId: "EQ1",
      isin: "EQ1",
      ticker: "EQ1",
      name: "Equity One",
      sector: "Equity",
      region: "Global",
      currentWeight: 0.3,
    },
    {
      assetId: "FI1",
      isin: "FI1",
      ticker: "FI1",
      name: "Bond One",
      sector: "Fixed Income",
      region: "Global",
      currentWeight: 0.3,
    },
    {
      assetId: "ALT1",
      isin: "ALT1",
      ticker: "ALT1",
      name: "Alt One",
      sector: "Alternatives",
      region: "Global",
      currentWeight: 0.2,
    },
    {
      assetId: "CAS",
      isin: "CAS",
      ticker: "CAS",
      name: "Cash",
      sector: "Cash",
      region: "United Kingdom",
      currentWeight: 0.2,
    },
  ];

  const constraints: Constraints = {
    asOf: "2025-09-30",
    objective: "Test constraints",
    minAssetWeight: 0.05,
    maxAssetWeight: 0.45,
    maxTurnover: 0.2,
    maxAssets: 10,
    notes: [],
    sectorBounds: [
      { sector: "Equity", min: 0.2, max: 0.4 },
      { sector: "Fixed Income", min: 0.2, max: 0.4 },
      { sector: "Alternatives", min: 0.1, max: 0.3 },
      { sector: "Cash", min: 0.05, max: 0.25 },
    ],
  };

  it("normalizes weights and limits turnover", () => {
    const weights = applyPortfolioConstraints(
      {
        EQ1: 0.7,
        FI1: 0.15,
        ALT1: 0.1,
        CAS: 0.05,
      },
      assets,
      constraints,
    );

    expect(sum(Object.values(weights))).toBeCloseTo(1, 5);
    expect(calculateTurnover(assets, weights)).toBeLessThanOrEqual(constraints.maxTurnover + 0.001);
  });

  it("reports sector exposure status", () => {
    const exposures = getSectorExposures(
      assets,
      {
        EQ1: 0.35,
        FI1: 0.3,
        ALT1: 0.2,
        CAS: 0.15,
      },
      constraints,
    );

    expect(exposures.every((exposure) => exposure.status === "within")).toBe(true);
  });
});

describe("portfolio recommendation", () => {
  it("is deterministic and keeps recommended weights at 100%", () => {
    const data = getPortfolioData();
    const first = buildPortfolioRecommendation(
      data.holdings,
      data.prices,
      data.benchmark,
      data.constraints,
    );
    const second = buildPortfolioRecommendation(
      data.holdings,
      data.prices,
      data.benchmark,
      data.constraints,
    );

    expect(first.rows).toEqual(second.rows);
    expect(sum(first.rows.map((row) => row.recommendedWeight))).toBeCloseTo(1, 5);
    expect(first.summary.turnover).toBeLessThanOrEqual(data.constraints.maxTurnover + 0.001);
    expect(first.rows.every((row) => row.rationale.length > 20)).toBe(true);
  });
});
