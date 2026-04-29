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
  Constraints,
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

export function buildPortfolioRecommendation(
  holdings: Holdings,
  prices: Prices,
  benchmark: Benchmark,
  constraints: Constraints,
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

  return {
    asOf: holdings.asOf,
    currency: holdings.currency,
    objective: constraints.objective,
    rows,
    sectorExposures,
    benchmarkName: benchmark.name,
    benchmarkMonthlyReturns,
    assetMonthlyReturns,
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
      "Daily prices are converted to month-end prices because the brief optimises on monthly returns.",
      "Assets are scored using annualised return divided by annualised volatility, then tilted from current weights.",
      "Soft constraints are applied after scoring so the output remains diversified, explainable, and turnover-aware.",
      "The calculation is deterministic and intentionally avoids an opaque optimiser for this small stakeholder-facing task.",
    ],
  };
}
