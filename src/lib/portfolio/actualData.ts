import rawBenchmark from "../../../data/actual/benchmark_actual.json";
import rawConstraints from "../../../data/actual/constraints_actual.json";
import rawHoldings from "../../../data/actual/holdings_actual.json";
import rawPrices from "../../../data/actual/prices_actual.json";
import type {
  Asset,
  Benchmark,
  Constraints,
  Holdings,
  PricePoint,
  Prices,
  SectorBound,
} from "./types";

type RawHolding = {
  isin: string;
  name: string;
  asset_class: string;
  currency: string;
  weight: number;
};

type RawPriceRow = {
  date: string | number;
  isin: string;
  price: number | string;
};

type RawConstraintFile = {
  min_weight: number;
  max_weight: number;
  per_asset_class_caps: Record<string, number>;
  max_assets: number;
};

const PORTFOLIO_CURRENCY = "USD";
const BENCHMARK_ID = "ACTUAL-BENCH";
const BENCHMARK_NAME = "Benchmark (level series from take-home data)";

function normalizeAssetClassLabel(raw: string): string {
  const key = raw.trim().toLowerCase();

  const map: Record<string, string> = {
    equity: "Equity",
    "fixed income": "Fixed Income",
    "fixed-income": "Fixed Income",
    fi: "Fixed Income",
    alternatives: "Alternatives",
    alt: "Alternatives",
  };

  return map[key] ?? raw.trim();
}

function makeAssetId(isin: string, index: number) {
  return `${isin}::${index}`;
}

function normalizeInputDate(value: string | number): string {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    // Source data may use Excel day serials (e.g. 45719) alongside ISO strings.
    return new Date((value - 25_569) * 86_400_000).toISOString().slice(0, 10);
  }

  throw new Error(`Unrecognised date value: ${String(value)}`);
}

function parseClose(price: number | string): number {
  if (typeof price === "number") {
    return price;
  }

  const value = Number.parseFloat(price);

  if (Number.isNaN(value) || value <= 0) {
    throw new Error(`Invalid or non-positive price: ${price}`);
  }

  return value;
}

function latestDate(dates: string[]) {
  return dates.reduce((max, d) => (d > max ? d : max), dates[0] ?? "");
}

export function buildPortfolioDataFromActual(): {
  holdings: Holdings;
  prices: Prices;
  benchmark: Benchmark;
  constraints: Constraints;
} {
  const holdingsRaw = rawHoldings as RawHolding[];
  const pricesRaw = rawPrices as RawPriceRow[];
  const levelsRaw = rawBenchmark as { date: string; level: number }[];
  const policyRaw = rawConstraints as RawConstraintFile;

  const assets: Asset[] = holdingsRaw.map((row, index) => ({
    assetId: makeAssetId(row.isin, index),
    ticker: row.isin.slice(-6),
    name: row.name,
    sector: normalizeAssetClassLabel(row.asset_class),
    region: "Global",
    currentWeight: row.weight,
  }));

  const weightTotal = assets.reduce((sum, asset) => sum + asset.currentWeight, 0);

  if (weightTotal <= 0 || Math.abs(weightTotal - 1) > 0.05) {
    throw new Error(
      `Actual holdings weights sum to ${weightTotal}; expected approximately 1 after rounding.`,
    );
  }

  const scale = 1 / weightTotal;

  for (const asset of assets) {
    asset.currentWeight *= scale;
  }

  const isinToAssetIds = new Map<string, string[]>();

  for (let index = 0; index < holdingsRaw.length; index += 1) {
    const row = holdingsRaw[index];
    const id = makeAssetId(row.isin, index);
    const list = isinToAssetIds.get(row.isin) ?? [];
    list.push(id);
    isinToAssetIds.set(row.isin, list);
  }

  const prices: PricePoint[] = [];

  for (const row of pricesRaw) {
    const close = parseClose(row.price);
    const ids = isinToAssetIds.get(row.isin);

    if (!ids?.length) {
      continue;
    }

    for (const assetId of ids) {
      prices.push({
        date: normalizeInputDate(row.date),
        assetId,
        close,
      });
    }
  }

  const priceDates = pricesRaw.map((row) => normalizeInputDate(row.date));
  const benchmarkDates = levelsRaw.map((row) => row.date);
  const asOf = latestDate([...priceDates, ...benchmarkDates]);

  const sectorBounds: SectorBound[] = Object.entries(policyRaw.per_asset_class_caps).map(
    ([sectorKey, max]) => ({
      sector: normalizeAssetClassLabel(sectorKey),
      min: 0,
      max,
    }),
  );

  const constraints: Constraints = {
    asOf,
    objective:
      "Tilt toward assets with stronger realised risk-adjusted monthly returns, subject to caps in `constraints_actual.json` and turnover.",
    maxAssetWeight: policyRaw.max_weight,
    minAssetWeight: policyRaw.min_weight,
    maxTurnover: 0.35,
    sectorBounds,
    notes: [
      "Soft constraints: preferences are enforced iteratively in code (not a single quadratic program).",
      `Policy file limits active names to ${policyRaw.max_assets}; combined with a positive minimum line size, full cardinality enforcement would require mixed-integer optimisation — see methodology.`,
      "Turnover cap (0.35 one-way, scaled) assumed where absent from the policy file; debrief default.",
    ],
  };

  const holdings: Holdings = {
    asOf,
    currency: PORTFOLIO_CURRENCY,
    assets,
  };

  const pricesTyped: Prices = {
    currency: PORTFOLIO_CURRENCY,
    frequency: "daily",
    prices,
  };

  const benchmark: Benchmark = {
    benchmarkId: BENCHMARK_ID,
    name: BENCHMARK_NAME,
    currency: PORTFOLIO_CURRENCY,
    levels: levelsRaw.map((row) => ({ date: row.date, level: row.level })),
  };

  return {
    holdings,
    prices: pricesTyped,
    benchmark,
    constraints,
  };
}
