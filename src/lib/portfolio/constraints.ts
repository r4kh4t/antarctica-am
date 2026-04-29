import type { Asset, Constraints, SectorExposure } from "./types";

const ROUNDING_DECIMALS = 4;
const EPSILON = 0.00001;

export function roundWeight(weight: number) {
  return Number(weight.toFixed(ROUNDING_DECIMALS));
}

export function normalizeWeights(weights: Record<string, number>) {
  const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0);

  if (total <= 0) {
    throw new Error("Cannot normalize weights when total weight is zero");
  }

  const normalized = Object.fromEntries(
    Object.entries(weights).map(([assetId, weight]) => [assetId, weight / total]),
  );

  return normalized;
}

export function calculateTurnover(assets: Asset[], weights: Record<string, number>) {
  const oneWayTurnover = assets.reduce(
    (sum, asset) => sum + Math.abs((weights[asset.assetId] ?? 0) - asset.currentWeight),
    0,
  );

  return oneWayTurnover / 2;
}

function redistributeExcess(
  weights: Record<string, number>,
  assets: Asset[],
  constraints: Constraints,
) {
  let excess = 0;

  for (const asset of assets) {
    const current = weights[asset.assetId] ?? 0;
    const capped = Math.min(
      Math.max(current, constraints.minAssetWeight),
      constraints.maxAssetWeight,
    );

    excess += current - capped;
    weights[asset.assetId] = capped;
  }

  if (Math.abs(excess) < EPSILON) {
    return weights;
  }

  const eligible = assets.filter((asset) => {
    const weight = weights[asset.assetId] ?? 0;
    return excess > 0 ? weight < constraints.maxAssetWeight : weight > constraints.minAssetWeight;
  });

  if (eligible.length === 0) {
    return weights;
  }

  const perAsset = excess / eligible.length;

  for (const asset of eligible) {
    weights[asset.assetId] = (weights[asset.assetId] ?? 0) + perAsset;
  }

  return weights;
}

function sectorWeight(weights: Record<string, number>, assets: Asset[], sector: string) {
  return assets
    .filter((asset) => asset.sector === sector)
    .reduce((sum, asset) => sum + (weights[asset.assetId] ?? 0), 0);
}

function adjustSectorBounds(
  weights: Record<string, number>,
  assets: Asset[],
  constraints: Constraints,
) {
  for (const bound of constraints.sectorBounds) {
    const currentSectorWeight = sectorWeight(weights, assets, bound.sector);

    if (currentSectorWeight > bound.max + EPSILON) {
      const excess = currentSectorWeight - bound.max;
      const sectorAssets = assets.filter((asset) => asset.sector === bound.sector);
      const otherAssets = assets.filter((asset) => asset.sector !== bound.sector);

      for (const asset of sectorAssets) {
        const share = (weights[asset.assetId] ?? 0) / currentSectorWeight;
        weights[asset.assetId] = (weights[asset.assetId] ?? 0) - excess * share;
      }

      const otherCapacity = otherAssets.reduce(
        (sum, asset) =>
          sum + Math.max(0, constraints.maxAssetWeight - (weights[asset.assetId] ?? 0)),
        0,
      );

      for (const asset of otherAssets) {
        const capacity = Math.max(0, constraints.maxAssetWeight - (weights[asset.assetId] ?? 0));
        weights[asset.assetId] =
          (weights[asset.assetId] ?? 0) + excess * (capacity / otherCapacity);
      }
    }

    if (currentSectorWeight < bound.min - EPSILON) {
      const shortfall = bound.min - currentSectorWeight;
      const sectorAssets = assets.filter((asset) => asset.sector === bound.sector);
      const otherAssets = assets.filter((asset) => asset.sector !== bound.sector);

      for (const asset of sectorAssets) {
        weights[asset.assetId] = (weights[asset.assetId] ?? 0) + shortfall / sectorAssets.length;
      }

      const otherWeight = otherAssets.reduce(
        (sum, asset) => sum + (weights[asset.assetId] ?? 0),
        0,
      );

      for (const asset of otherAssets) {
        const share = (weights[asset.assetId] ?? 0) / otherWeight;
        weights[asset.assetId] = (weights[asset.assetId] ?? 0) - shortfall * share;
      }
    }
  }

  return weights;
}

function limitTurnover(weights: Record<string, number>, assets: Asset[], maxTurnover: number) {
  const turnover = calculateTurnover(assets, weights);

  if (turnover <= maxTurnover || turnover === 0) {
    return weights;
  }

  const scale = maxTurnover / turnover;

  return Object.fromEntries(
    assets.map((asset) => {
      const target = weights[asset.assetId] ?? asset.currentWeight;
      return [asset.assetId, asset.currentWeight + (target - asset.currentWeight) * scale];
    }),
  );
}

export function applyPortfolioConstraints(
  proposedWeights: Record<string, number>,
  assets: Asset[],
  constraints: Constraints,
) {
  let weights = normalizeWeights({ ...proposedWeights });

  for (let iteration = 0; iteration < 4; iteration += 1) {
    weights = redistributeExcess(weights, assets, constraints);
    weights = normalizeWeights(weights);
    weights = adjustSectorBounds(weights, assets, constraints);
    weights = normalizeWeights(weights);
  }

  weights = limitTurnover(weights, assets, constraints.maxTurnover);
  weights = normalizeWeights(weights);

  const rounded = Object.fromEntries(
    Object.entries(weights).map(([assetId, weight]) => [assetId, roundWeight(weight)]),
  );
  const roundedTotal = Object.values(rounded).reduce((sum, weight) => sum + weight, 0);
  const residual = roundWeight(1 - roundedTotal);
  const largestAsset = [...assets].sort(
    (left, right) => (rounded[right.assetId] ?? 0) - (rounded[left.assetId] ?? 0),
  )[0];

  if (largestAsset && Math.abs(residual) > 0) {
    rounded[largestAsset.assetId] = roundWeight((rounded[largestAsset.assetId] ?? 0) + residual);
  }

  return rounded;
}

export function getSectorExposures(
  assets: Asset[],
  recommendedWeights: Record<string, number>,
  constraints: Constraints,
): SectorExposure[] {
  return constraints.sectorBounds.map((bound) => {
    const currentWeight = assets
      .filter((asset) => asset.sector === bound.sector)
      .reduce((sum, asset) => sum + asset.currentWeight, 0);
    const recommendedWeight = sectorWeight(recommendedWeights, assets, bound.sector);
    const status =
      recommendedWeight < bound.min - EPSILON
        ? "below"
        : recommendedWeight > bound.max + EPSILON
          ? "above"
          : "within";

    return {
      sector: bound.sector,
      min: bound.min,
      max: bound.max,
      currentWeight: roundWeight(currentWeight),
      recommendedWeight: roundWeight(recommendedWeight),
      status,
    };
  });
}
