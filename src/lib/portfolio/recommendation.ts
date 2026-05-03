import {
  applyPortfolioConstraints,
  calculateTurnover,
  getSectorExposures,
  roundWeight,
} from "./constraints";
import {
  calculateAssetMonthlyReturns,
  calculateBenchmarkMonthlyReturns,
  mean,
  sampleStandardDeviation,
} from "./monthlyReturns";
import type {
  Asset,
  AssetMetric,
  Benchmark,
  ConstraintCompliance,
  Constraints,
  DataWarning,
  Holdings,
  PortfolioRecommendation,
  Prices,
} from "./types";

const TILT_STRENGTH = 0.45;

function byAssetReturnValues(metrics: AssetMetric[]) {
  return Object.fromEntries(
    metrics.map((metric) => [metric.asset.assetId, metric.monthlyReturns.map((row) => row.return)]),
  );
}

function calculateMetrics(holdings: Holdings, prices: Prices, benchmark: Benchmark): AssetMetric[] {
  const monthlyReturns = calculateAssetMonthlyReturns(prices.prices);
  const benchmarkReturns = calculateBenchmarkMonthlyReturns(benchmark.levels);
  const benchmarkAverageMonthlyReturn = mean(benchmarkReturns.map((row) => row.return));

  return holdings.assets.map((asset) => {
    const assetReturns = monthlyReturns.filter((row) => row.assetId === asset.assetId);
    const values = assetReturns.map((row) => row.return);
    const averageMonthlyReturn = mean(values);
    const monthlyVolatility = sampleStandardDeviation(values);
    const annualizedReturn = (1 + averageMonthlyReturn) ** 12 - 1;
    const annualizedVolatility = monthlyVolatility * Math.sqrt(12);
    const riskAdjustedScore =
      annualizedVolatility === 0 ? annualizedReturn : annualizedReturn / annualizedVolatility;

    return {
      asset,
      monthlyReturns: assetReturns,
      averageMonthlyReturn,
      monthlyVolatility,
      annualizedReturn,
      annualizedVolatility,
      riskAdjustedScore,
      benchmarkRelativeReturn: averageMonthlyReturn - benchmarkAverageMonthlyReturn,
    };
  });
}

function proposedWeightsFromScores(metrics: AssetMetric[]) {
  const scores = metrics.map((metric) => metric.riskAdjustedScore);
  const averageScore = mean(scores);
  const scoreVolatility = sampleStandardDeviation(scores) || 1;

  return Object.fromEntries(
    metrics.map((metric) => {
      const zScore = (metric.riskAdjustedScore - averageScore) / scoreVolatility;
      const tilt = Math.max(-0.35, Math.min(0.35, zScore * TILT_STRENGTH));
      return [metric.asset.assetId, metric.asset.currentWeight * (1 + tilt)];
    }),
  );
}

function buildRationale(metric: AssetMetric, recommendedWeight: number) {
  const delta = recommendedWeight - metric.asset.currentWeight;
  const direction = delta > 0.002 ? "Increase" : delta < -0.002 ? "Reduce" : "Hold";
  const performance =
    metric.benchmarkRelativeReturn >= 0
      ? "monthly returns are ahead of the benchmark"
      : "monthly returns trail the benchmark";
  const risk =
    metric.annualizedVolatility < 0.05
      ? "with low realised volatility"
      : metric.annualizedVolatility > 0.12
        ? "but with higher realised volatility"
        : "with moderate realised volatility";

  if (direction === "Hold") {
    return `Hold near current weight: ${performance} ${risk}, and constraints do not require a larger move.`;
  }

  return `${direction}: ${performance} ${risk}; the final weight also reflects turnover and sector constraints.`;
}

function weightedAverage(
  metrics: AssetMetric[],
  weights: Record<string, number>,
  getValue: (metric: AssetMetric) => number,
) {
  return metrics.reduce(
    (sum, metric) => sum + (weights[metric.asset.assetId] ?? 0) * getValue(metric),
    0,
  );
}

function approximatePortfolioVolatility(metrics: AssetMetric[], weights: Record<string, number>) {
  const returnsByAsset = byAssetReturnValues(metrics);
  const months = metrics[0]?.monthlyReturns.map((row) => row.month) ?? [];
  const portfolioReturns = months.map((month, index) =>
    metrics.reduce((sum, metric) => {
      const assetReturns = returnsByAsset[metric.asset.assetId] ?? [];
      return sum + (weights[metric.asset.assetId] ?? 0) * (assetReturns[index] ?? 0);
    }, 0),
  );

  return sampleStandardDeviation(portfolioReturns) * Math.sqrt(12);
}

function currentWeights(assets: Asset[]) {
  return Object.fromEntries(assets.map((asset) => [asset.assetId, asset.currentWeight]));
}

function computeConstraintCompliance(
  rows: { name: string; isin: string; recommendedWeight: number }[],
  constraints: Constraints,
  sectorExposures: { sector: string; recommendedWeight: number; max: number }[],
): ConstraintCompliance {
  // Count unique ISINs with non-trivial weight — a duplicate ISIN row is the
  // same economic position, so we de-duplicate before comparing to maxAssets.
  const uniqueActiveIsins = new Set(
    rows.filter((r) => r.recommendedWeight > 0.0001).map((r) => r.isin),
  );
  const uniqueActiveCount = uniqueActiveIsins.size;
  const maxAssetsPassed = uniqueActiveCount <= constraints.maxAssets;

  // This optimizer uses weight tilting, not hard selection: all holdings are
  // retained at adjusted weights. maxAssets is therefore a soft cap.
  const maxAssetsNote = maxAssetsPassed
    ? "Tilt-based optimizer — all holdings retained at adjusted weights"
    : `Soft violation: tilt-based optimizer retains all ${uniqueActiveCount} unique holdings. A hard Sharpe-selection step (zeroing out bottom performers) would enforce the limit of ${constraints.maxAssets} strictly.`;

  const weightViolations: string[] = [];
  for (const row of rows) {
    if (row.recommendedWeight > 0.0001) {
      if (row.recommendedWeight < constraints.minAssetWeight - 0.0001) {
        weightViolations.push(
          `${row.name} (${(row.recommendedWeight * 100).toFixed(1)}% < min ${(constraints.minAssetWeight * 100).toFixed(0)}%)`,
        );
      }
      if (row.recommendedWeight > constraints.maxAssetWeight + 0.0001) {
        weightViolations.push(
          `${row.name} (${(row.recommendedWeight * 100).toFixed(1)}% > max ${(constraints.maxAssetWeight * 100).toFixed(0)}%)`,
        );
      }
    }
  }

  const classCapViolations: string[] = [];
  for (const exposure of sectorExposures) {
    if (exposure.recommendedWeight > exposure.max + 0.0001) {
      classCapViolations.push(
        `${exposure.sector} (${(exposure.recommendedWeight * 100).toFixed(1)}% > cap ${(exposure.max * 100).toFixed(0)}%)`,
      );
    }
  }

  return {
    maxAssets: {
      passed: maxAssetsPassed,
      actual: uniqueActiveCount,
      limit: constraints.maxAssets,
      note: maxAssetsNote,
    },
    weightBounds: {
      passed: weightViolations.length === 0,
      min: constraints.minAssetWeight,
      max: constraints.maxAssetWeight,
      violations: weightViolations,
    },
    classCaps: { passed: classCapViolations.length === 0, violations: classCapViolations },
  };
}

export function buildPortfolioRecommendation(
  holdings: Holdings,
  prices: Prices,
  benchmark: Benchmark,
  constraints: Constraints,
  dataWarnings: DataWarning[] = [],
): PortfolioRecommendation {
  const metrics = calculateMetrics(holdings, prices, benchmark);
  const proposedWeights = proposedWeightsFromScores(metrics);
  const recommendedWeights = applyPortfolioConstraints(
    proposedWeights,
    holdings.assets,
    constraints,
  );
  const currentWeightMap = currentWeights(holdings.assets);
  const sectorExposures = getSectorExposures(holdings.assets, recommendedWeights, constraints);
  const benchmarkMonthlyReturns = calculateBenchmarkMonthlyReturns(benchmark.levels);
  const constraintStatus = sectorExposures.every((sector) => sector.status === "within")
    ? "Within soft constraints"
    : "Review required";

  const rows = metrics
    .map((metric) => {
      const recommendedWeight =
        recommendedWeights[metric.asset.assetId] ?? metric.asset.currentWeight;

      return {
        assetId: metric.asset.assetId,
        isin: metric.asset.isin,
        ticker: metric.asset.ticker,
        name: metric.asset.name,
        sector: metric.asset.sector,
        region: metric.asset.region,
        currentWeight: roundWeight(metric.asset.currentWeight),
        recommendedWeight: roundWeight(recommendedWeight),
        weightDelta: roundWeight(recommendedWeight - metric.asset.currentWeight),
        averageMonthlyReturn: metric.averageMonthlyReturn,
        annualizedVolatility: metric.annualizedVolatility,
        riskAdjustedScore: metric.riskAdjustedScore,
        rationale: buildRationale(metric, recommendedWeight),
      };
    })
    .sort((left, right) => right.recommendedWeight - left.recommendedWeight);

  const assetMonthlyReturns = metrics.flatMap((metric) =>
    metric.monthlyReturns.map((mr) => ({
      assetId: metric.asset.assetId,
      ticker: metric.asset.ticker,
      month: mr.month,
      return: mr.return,
    })),
  );

  const constraintCompliance = computeConstraintCompliance(rows, constraints, sectorExposures);

  return {
    asOf: holdings.asOf,
    currency: holdings.currency,
    objective: constraints.objective,
    rows,
    sectorExposures,
    benchmarkName: benchmark.name,
    benchmarkMonthlyReturns,
    assetMonthlyReturns,
    dataWarnings,
    constraintCompliance,
    summary: {
      expectedMonthlyReturn: weightedAverage(
        metrics,
        recommendedWeights,
        (metric) => metric.averageMonthlyReturn,
      ),
      currentExpectedMonthlyReturn: weightedAverage(
        metrics,
        currentWeightMap,
        (metric) => metric.averageMonthlyReturn,
      ),
      expectedAnnualizedVolatility: approximatePortfolioVolatility(metrics, recommendedWeights),
      turnover: calculateTurnover(holdings.assets, recommendedWeights),
      constraintStatus,
      benchmarkAverageMonthlyReturn: mean(benchmarkMonthlyReturns.map((row) => row.return)),
    },
    methodology: [
      "Monthly return is month-on-month from month-end levels: r = P(end)/P(prev) - 1 (arithmetic; log returns would rank similarly for small moves).",
      "Each month uses the last available daily price in that calendar month; rows with non-numeric or non-positive prices are dropped at load. Sparse months reduce the return sample—no forward-fill across missing dates.",
      "Assets are scored with annualised return ÷ annualised volatility (a Sharpe-like ranking), then tilted from current weights—not a full covariance Markowitz solve.",
      "Soft constraints (min/max line, asset-class caps, turnover) are enforced by iterative projection and rescaling, so violations shrink but are not guaranteed zero without a constrained QP.",
      "Deterministic pipeline suitable for debrief: inspect data → metrics → tilt → constraints.",
    ],
  };
}
