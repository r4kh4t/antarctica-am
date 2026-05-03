import { buildPortfolioDataFromActual } from "./actualData";
import type { Holdings } from "./types";

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
  const { holdings, prices, benchmark, constraints, dataWarnings } = buildPortfolioDataFromActual();

  assertUniqueAssets(holdings.assets);
  assertWeightTotal(holdings.assets);

  return {
    holdings,
    prices,
    benchmark,
    constraints,
    dataWarnings,
  };
}
