import benchmark from "../../../data/benchmark.json";
import constraints from "../../../data/constraints.json";
import holdings from "../../../data/holdings.json";
import prices from "../../../data/prices.json";
import type { Benchmark, Constraints, Holdings, Prices } from "./types";

function assertWeightTotal(assets: Holdings["assets"]) {
  const total = assets.reduce((sum, asset) => sum + asset.currentWeight, 0);

  if (Math.abs(total - 1) > 0.0001) {
    throw new Error(`Current holding weights must sum to 100%; received ${total}`);
  }
}

function assertUniqueAssets(assets: Holdings["assets"]) {
  const ids = new Set<string>();

  for (const asset of assets) {
    if (ids.has(asset.assetId)) {
      throw new Error(`Duplicate asset id in holdings: ${asset.assetId}`);
    }

    ids.add(asset.assetId);
  }
}

export function getPortfolioData() {
  const typedHoldings = holdings as Holdings;
  const typedPrices = prices as Prices;
  const typedBenchmark = benchmark as Benchmark;
  const typedConstraints = constraints as Constraints;

  assertUniqueAssets(typedHoldings.assets);
  assertWeightTotal(typedHoldings.assets);

  return {
    holdings: typedHoldings,
    prices: typedPrices,
    benchmark: typedBenchmark,
    constraints: typedConstraints,
  };
}
