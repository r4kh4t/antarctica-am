import { format, isValid, parse } from "date-fns";
import { z } from "zod";
import rawBenchmark from "../../../data/benchmark.json";
import rawConstraints from "../../../data/constraints.json";
import rawHoldings from "../../../data/holdings.json";
import rawPrices from "../../../data/prices.json";
import type {
  Asset,
  Benchmark,
  Constraints,
  Holdings,
  PricePoint,
  Prices,
  SectorBound,
} from "./types";

// ---------------------------------------------------------------------------
// Zod schemas — validate raw JSON shape at load time so shape mismatches
// surface as typed errors instead of silent runtime failures downstream.
// ---------------------------------------------------------------------------

const RawHoldingSchema = z.object({
  isin: z.string().min(1),
  name: z.string().min(1),
  asset_class: z.string().min(1),
  currency: z.string().min(1),
  weight: z.number(),
});

/** date is a string in the benchmark file; level is a positive number. */
const RawBenchmarkLevelSchema = z.object({
  date: z.string().min(1),
  level: z.number().positive(),
});

/**
 * price rows use mixed types in the source data:
 *  - date:  ISO string, ISO datetime string, DD/MM/YYYY string, or Excel serial (number)
 *  - price: number or numeric string
 */
const RawPriceRowSchema = z.object({
  date: z.union([z.string().min(1), z.number()]),
  isin: z.string().min(1),
  price: z.union([z.number(), z.string().min(1)]),
});

const RawConstraintFileSchema = z.object({
  min_weight: z.number().nonnegative(),
  max_weight: z.number().positive(),
  per_asset_class_caps: z.record(z.string(), z.number().positive()),
  max_assets: z.number().int().positive(),
});

// Infer TypeScript types from the schemas so the rest of the file has a
// single source of truth rather than a separate manual type declaration.
type RawHolding = z.infer<typeof RawHoldingSchema>;
type RawPriceRow = z.infer<typeof RawPriceRowSchema>;
type RawConstraintFile = z.infer<typeof RawConstraintFileSchema>;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PORTFOLIO_CURRENCY = "USD";
const BENCHMARK_ID = "ACTUAL-BENCH";
const BENCHMARK_NAME = "Benchmark (level series from take-home data)";

// ---------------------------------------------------------------------------
// Domain helpers
// ---------------------------------------------------------------------------

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

/**
 * Converts an Excel day serial (e.g. 45719) to "YYYY-MM-DD".
 * Uses toISOString to stay in UTC and avoid a local-timezone shift
 * turning midnight UTC into the previous calendar day.
 */
function fromExcelSerial(serial: number): string {
  return new Date((serial - 25_569) * 86_400_000).toISOString().slice(0, 10);
}

/**
 * Normalises a date string to "YYYY-MM-DD".
 * Handles three formats found in prices.json:
 *   - ISO datetime  "2024-10-03T23:59:59Z" → slice before tz conversion
 *   - ISO date      "2024-10-03"            → pass through
 *   - DD/MM/YYYY    "28/07/2025"            → reformat with date-fns
 * Returns the input unchanged for any unrecognised format.
 */
function normalizeDateString(value: string): string {
  // ISO datetime — slice to date part before any tz conversion.
  // Letting date-fns parse a UTC end-of-day string in UTC+8 would shift
  // "2024-10-03T23:59:59Z" to 2024-10-04 local.
  if (value.length > 10 && value[10] === "T") {
    return value.slice(0, 10);
  }
  // ISO date — already canonical.
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  // DD/MM/YYYY (confirmed by day values > 12 in source data).
  const parsed = parse(value, "dd/MM/yyyy", new Date(0));
  if (isValid(parsed)) {
    return format(parsed, "yyyy-MM-dd");
  }
  return value;
}

/**
 * Public entry point: normalises any raw date value from the source JSON
 * to the canonical "YYYY-MM-DD" ISO string used throughout the app.
 */
function normalizeInputDate(value: string | number): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    return fromExcelSerial(value);
  }
  if (typeof value === "string") {
    return normalizeDateString(value);
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

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function buildPortfolioDataFromActual(): {
  holdings: Holdings;
  prices: Prices;
  benchmark: Benchmark;
  constraints: Constraints;
} {
  // Zod .parse() replaces the previous `as` casts: a shape mismatch now throws
  // a ZodError with a precise field path instead of a silent runtime failure.
  const holdingsRaw: RawHolding[] = z.array(RawHoldingSchema).parse(rawHoldings);
  const pricesRaw: RawPriceRow[] = z.array(RawPriceRowSchema).parse(rawPrices);
  const levelsRaw = z.array(RawBenchmarkLevelSchema).parse(rawBenchmark);
  const policyRaw: RawConstraintFile = RawConstraintFileSchema.parse(rawConstraints);

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
  // Normalise benchmark dates through the same pipeline so asOf comparison is apples-to-apples.
  const benchmarkDates = levelsRaw.map((row) => normalizeDateString(row.date));
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
      "Tilt toward assets with stronger realised risk-adjusted monthly returns, subject to caps in `constraints.json` and turnover.",
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
    levels: levelsRaw.map((row) => ({ date: normalizeDateString(row.date), level: row.level })),
  };

  return {
    holdings,
    prices: pricesTyped,
    benchmark,
    constraints,
  };
}
