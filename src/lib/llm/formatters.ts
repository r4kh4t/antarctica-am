import type { RationaleRequest } from "./guardrails";

function pct(value: number, decimals = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

function score(value: number): string {
  return value.toFixed(2);
}

/**
 * Converts a portfolio recommendation request into markdown tables.
 * The Asset ID column is critical — it must match the keys in the LLM's JSON response.
 */
export function formatForLLM(req: RationaleRequest): string {
  const { rows, summary, sectorExposures, benchmarkName, asOf } = req;

  const sorted = [...rows].sort((a, b) => b.recommendedWeight - a.recommendedWeight);

  const rebalancingTable = [
    `## Proposed Rebalancing — ${asOf}`,
    "",
    "| Asset ID | Name | Ticker | Sector | Region | Current | Recommended | Change |",
    "|----------|------|--------|--------|--------|--------:|------------:|-------:|",
    ...sorted.map(
      (r) =>
        `| \`${r.assetId}\` | ${r.name} | **${r.ticker}** | ${r.sector} | ${r.region} | ${pct(r.currentWeight)} | ${pct(r.recommendedWeight)} | ${r.weightDelta >= 0 ? "+" : ""}${pct(r.weightDelta)} |`,
    ),
  ].join("\n");

  const metricsTable = [
    "",
    "## Asset Performance Metrics",
    "",
    "| Asset ID | Ticker | Avg Monthly Return | Ann. Volatility | Risk-Adj Score | vs Benchmark |",
    "|----------|--------|-----------------:|----------------:|---------------:|-------------:|",
    ...sorted.map((r) => {
      const vsBenchmark = r.averageMonthlyReturn - summary.benchmarkAverageMonthlyReturn;
      return `| \`${r.assetId}\` | **${r.ticker}** | ${pct(r.averageMonthlyReturn)} | ${pct(r.annualizedVolatility)} | ${score(r.riskAdjustedScore)} | ${vsBenchmark >= 0 ? "+" : ""}${pct(vsBenchmark)} |`;
    }),
  ].join("\n");

  const sectorsTable = [
    "",
    "## Sector Exposures",
    "",
    "| Sector | Current | Recommended | Range | Status |",
    "|--------|--------:|------------:|-------|--------|",
    ...sectorExposures.map(
      (s) =>
        `| **${s.sector}** | ${pct(s.currentWeight)} | ${pct(s.recommendedWeight)} | ${pct(s.min, 0)}–${pct(s.max, 0)} | ${s.status} |`,
    ),
  ].join("\n");

  const portfolioSummary = [
    "",
    "## Portfolio Context",
    "",
    `| Metric | Current | Recommended |`,
    `|--------|--------:|------------:|`,
    `| Expected monthly return | ${pct(summary.currentExpectedMonthlyReturn)} | ${pct(summary.expectedMonthlyReturn)} |`,
    `| Annualised volatility | — | ${pct(summary.expectedAnnualizedVolatility)} |`,
    `| One-way turnover | — | ${pct(summary.turnover)} |`,
    `| Benchmark avg monthly return (${benchmarkName}) | ${pct(summary.benchmarkAverageMonthlyReturn)} | — |`,
  ].join("\n");

  return [rebalancingTable, metricsTable, sectorsTable, portfolioSummary].join("\n");
}
