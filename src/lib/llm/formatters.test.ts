import { describe, expect, it } from "vitest";
import { formatForLLM } from "./formatters";
import type { RationaleRequest } from "./guardrails";

const BASE_REQUEST: RationaleRequest = {
  rows: [
    {
      assetId: "AAM-LGQ",
      isin: "AAM-LGQ",
      ticker: "LGQ",
      name: "London Global Quality Equity",
      sector: "Global Equity",
      region: "Global",
      currentWeight: 0.18,
      recommendedWeight: 0.2,
      weightDelta: 0.02,
      averageMonthlyReturn: 0.012,
      annualizedVolatility: 0.08,
      riskAdjustedScore: 1.8,
      rationale: "Strong performer.",
    },
    {
      assetId: "AAM-IGC",
      isin: "AAM-IGC",
      ticker: "IGC",
      name: "Investment Grade Credit",
      sector: "Fixed Income",
      region: "Global",
      currentWeight: 0.15,
      recommendedWeight: 0.12,
      weightDelta: -0.03,
      averageMonthlyReturn: 0.005,
      annualizedVolatility: 0.04,
      riskAdjustedScore: 1.1,
      rationale: "Lower score.",
    },
  ],
  sectorExposures: [
    {
      sector: "Global Equity",
      min: 0.2,
      max: 0.5,
      currentWeight: 0.18,
      recommendedWeight: 0.2,
      status: "within",
    },
  ],
  summary: {
    expectedMonthlyReturn: 0.011,
    currentExpectedMonthlyReturn: 0.009,
    expectedAnnualizedVolatility: 0.07,
    turnover: 0.05,
    benchmarkAverageMonthlyReturn: 0.008,
  },
  benchmarkName: "Antarctica Balanced Reference",
  asOf: "2026-04",
};

describe("formatForLLM", () => {
  it("includes the assetId for every row", () => {
    const output = formatForLLM(BASE_REQUEST);
    expect(output).toContain("AAM-LGQ");
    expect(output).toContain("AAM-IGC");
  });

  it("formats the asOf date in the section heading", () => {
    const output = formatForLLM(BASE_REQUEST);
    expect(output).toContain("2026-04");
  });

  it("includes sector exposure data", () => {
    const output = formatForLLM(BASE_REQUEST);
    expect(output).toContain("Global Equity");
    expect(output).toContain("within");
  });

  it("includes the benchmark name in portfolio context", () => {
    const output = formatForLLM(BASE_REQUEST);
    expect(output).toContain("Antarctica Balanced Reference");
  });

  it("produces markdown tables (header row with pipes)", () => {
    const output = formatForLLM(BASE_REQUEST);
    const tableRows = output.split("\n").filter((line) => line.startsWith("|"));
    expect(tableRows.length).toBeGreaterThan(4);
  });

  it("formats percentages with % sign", () => {
    const output = formatForLLM(BASE_REQUEST);
    expect(output).toMatch(/\d+\.\d+%/);
  });

  it("sorts rows by recommended weight descending", () => {
    const output = formatForLLM(BASE_REQUEST);
    const lgqIndex = output.indexOf("AAM-LGQ");
    const igcIndex = output.indexOf("AAM-IGC");
    // AAM-LGQ has higher recommendedWeight (0.2 > 0.12) so should appear first
    expect(lgqIndex).toBeLessThan(igcIndex);
  });
});
