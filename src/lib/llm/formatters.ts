import type { RationaleRequest } from "./guardrails";

function pct(value: number, decimals = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

function score(value: number): string {
  return value.toFixed(2);
}

/**
 * Converts a portfolio recommendation request into markdown tables that give
 * an LLM rich, structured context without requiring it to parse raw JSON.
 */
export function formatForLLM(req: RationaleRequest): string {
  const { rows, summary, benchmarkName, asOf } = req;

  const sorted = [...rows].sort((a, b) => b.recommendedWeight - a.recommendedWeight);

  const rebalancingTable = [
    `## Proposed Rebalancing — ${asOf}`,
    "",
    "| Asset | Ticker | Sector | Region | Current | Recommended | Change |",
    "|-------|--------|--------|--------|--------:|------------:|-------:|",
    ...sorted.map(
      (r) =>
        `| ${r.name} | **${r.ticker}** | ${r.sector} | ${r.region} | ${pct(r.currentWeight)} | ${pct(r.recommendedWeight)} | ${r.weightDelta >= 0 ? "+" : ""}${pct(r.weightDelta)} |`,
    ),
  ].join("\n");

  const metricsTable = [
    "",
    "## Asset Performance Metrics",
    "",
    "| Ticker | Avg Monthly Return | Ann. Volatility | Risk-Adj Score | vs Benchmark |",
    "|--------|-----------------:|----------------:|---------------:|-------------:|",
    ...sorted.map((r) => {
      const vsBenchmark = r.averageMonthlyReturn - summary.benchmarkAverageMonthlyReturn;
      return `| **${r.ticker}** | ${pct(r.averageMonthlyReturn)} | ${pct(r.annualizedVolatility)} | ${score(r.riskAdjustedScore)} | ${vsBenchmark >= 0 ? "+" : ""}${pct(vsBenchmark)} |`;
    }),
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

  return [rebalancingTable, metricsTable, portfolioSummary].join("\n");
}
