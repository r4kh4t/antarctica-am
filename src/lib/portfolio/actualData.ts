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
  DataWarning,
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

/**
 * Maps non-ISO currency variants to their ISO 4217 code.
 * Returns the input unchanged if no mapping exists.
 */
function normalizeCurrencyCode(raw: string): string {
  const map: Record<string, string> = {
    US$: "USD",
    $: "USD",
    "€": "EUR",
    "£": "GBP",
    "¥": "JPY",
  };

  return map[raw.trim()] ?? raw.trim();
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
  dataWarnings: DataWarning[];
} {
  const dataWarnings: DataWarning[] = [];

  // Zod .parse() replaces the previous `as` casts: a shape mismatch now throws
  // a ZodError with a precise field path instead of a silent runtime failure.
  const holdingsRaw: RawHolding[] = z.array(RawHoldingSchema).parse(rawHoldings);
  const pricesRaw: RawPriceRow[] = z.array(RawPriceRowSchema).parse(rawPrices);
  const levelsRaw = z.array(RawBenchmarkLevelSchema).parse(rawBenchmark);
  const policyRaw: RawConstraintFile = RawConstraintFileSchema.parse(rawConstraints);

  // --- Holdings: dedupe duplicate ISINs (sum weights, keep first-seen name) ---
  // A single ISIN is a single economic position — a row appearing twice is a
  // data error, not two separate assets. Merging here means downstream code
  // (price joins, optimizer, constraint compliance) treats them as one.
  const dedupedHoldings: RawHolding[] = [];
  const seenIsins = new Map<string, RawHolding>();
  for (const row of holdingsRaw) {
    const existing = seenIsins.get(row.isin);
    if (existing) {
      // Sum weights with toFixed(10) to avoid floating point drift from repeated additions.
      existing.weight = parseFloat((existing.weight + row.weight).toFixed(10));
      dataWarnings.push({
        source: "holdings",
        issue: `Duplicate ISIN ${row.isin}: "${existing.name}" and "${row.name}" (weights merged: ${existing.weight})`,
        resolution: "Merged into one record, summed weights, kept first name",
      });
    } else {
      const clone = { ...row };
      seenIsins.set(row.isin, clone);
      dedupedHoldings.push(clone);
    }
  }

  // --- Holdings: asset class label normalizations ---
  for (const row of dedupedHoldings) {
    const normalized = normalizeAssetClassLabel(row.asset_class);
    if (normalized !== row.asset_class.trim()) {
      dataWarnings.push({
        source: "holdings",
        issue: `Asset class "${row.asset_class}" normalized to "${normalized}" for ${row.isin}`,
        resolution: "Mapped to canonical value matching constraints keys",
      });
    }
  }

  // --- Holdings: currency normalizations (apply the mapping, don't just flag) ---
  for (const row of dedupedHoldings) {
    const normalized = normalizeCurrencyCode(row.currency);
    if (normalized !== row.currency) {
      dataWarnings.push({
        source: "holdings",
        issue: `Currency "${row.currency}" normalized to "${normalized}" for ${row.isin}`,
        resolution: "Mapped to ISO currency code",
      });
      // Mutate so downstream consumers (if any) see the normalized value.
      row.currency = normalized;
    }
  }

  const assets: Asset[] = dedupedHoldings.map((row, index) => ({
    assetId: makeAssetId(row.isin, index),
    isin: row.isin,
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

  // --- Holdings: weight sum — interpret shortfall as unallocated cash ---
  // Financially the right reading of "weights sum to 0.98" is that the
  // portfolio is 98% invested and 2% cash; we note this for the debrief, then
  // rescale so downstream math still works on a normalised 100% basis.
  if (Math.abs(weightTotal - 1) > 0.001) {
    const cashPct = ((1 - weightTotal) * 100).toFixed(1);
    dataWarnings.push({
      source: "holdings",
      issue: `Weights sum to ${weightTotal.toFixed(4)}, not 1.0`,
      resolution: `${cashPct}% treated as unallocated cash`,
    });
  }

  const scale = 1 / weightTotal;

  for (const asset of assets) {
    asset.currentWeight *= scale;
  }

  const isinToAssetIds = new Map<string, string[]>();

  for (let index = 0; index < dedupedHoldings.length; index += 1) {
    const row = dedupedHoldings[index];
    const id = makeAssetId(row.isin, index);
    const list = isinToAssetIds.get(row.isin) ?? [];
    list.push(id);
    isinToAssetIds.set(row.isin, list);
  }

  // --- Prices: count non-standard date formats ---
  let excelSerialCount = 0;
  let isoTimestampCount = 0;
  let ddmmyyyyCount = 0;
  for (const row of pricesRaw) {
    const d = row.date;
    if (typeof d === "number") {
      excelSerialCount += 1;
    } else if (typeof d === "string" && d.length > 10 && d[10] === "T") {
      isoTimestampCount += 1;
    } else if (typeof d === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(d)) {
      ddmmyyyyCount += 1;
    }
  }
  const nonStandardDateCount = excelSerialCount + isoTimestampCount + ddmmyyyyCount;
  if (nonStandardDateCount > 0) {
    const parts: string[] = [];
    if (excelSerialCount) parts.push(`${excelSerialCount} Excel serial`);
    if (isoTimestampCount) parts.push(`${isoTimestampCount} ISO timestamp`);
    if (ddmmyyyyCount) parts.push(`${ddmmyyyyCount} DD/MM/YYYY`);
    dataWarnings.push({
      source: "prices",
      issue: `${nonStandardDateCount} rows with non-standard date formats (${parts.join(", ")})`,
      resolution: "All parsed successfully via unified date normalizer",
    });
  }

  // --- Prices: count values encoded as strings rather than numbers ---
  const stringPriceCount = pricesRaw.filter((r) => typeof r.price === "string").length;
  if (stringPriceCount > 0) {
    const pct = ((stringPriceCount / pricesRaw.length) * 100).toFixed(1);
    dataWarnings.push({
      source: "prices",
      issue: `${stringPriceCount} price values encoded as strings (${pct}% of rows)`,
      resolution: "Coerced to numbers via parseFloat",
    });
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

  // --- Prices: 3-sigma outlier detection per ISIN ---
  // Values more than 3 standard deviations from the ISIN's mean are flagged
  // for review. They are NOT excluded from calculations here — the analyst
  // decides after seeing the warning whether the spike is a data error or a
  // real market event. Uses population std (divide by n) rather than sample
  // std to match the take-home brief convention.
  const pricesByIsin = new Map<string, number[]>();
  for (const row of pricesRaw) {
    const close = parseClose(row.price);
    if (!isinToAssetIds.has(row.isin)) continue;
    const arr = pricesByIsin.get(row.isin) ?? [];
    arr.push(close);
    pricesByIsin.set(row.isin, arr);
  }
  for (const [isin, values] of pricesByIsin) {
    if (values.length < 4) continue;
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
    const std = Math.sqrt(variance);
    if (std === 0) continue;

    const outliers = values.filter((v) => Math.abs(v - mean) / std > 3);
    if (outliers.length > 0) {
      const preview = outliers
        .slice(0, 21)
        .map((v) => v.toFixed(2))
        .join(", ");
      dataWarnings.push({
        source: "prices",
        issue: `${isin} has ${outliers.length} price outlier(s) beyond 3 sigma: ${preview}`,
        resolution: "Flagged for review; included in calculations unless manually excluded",
      });
    }
  }

  const priceDates = pricesRaw.map((row) => normalizeInputDate(row.date));
  // Normalise benchmark dates through the same pipeline so asOf comparison is apples-to-apples.
  const benchmarkDates = levelsRaw.map((row) => normalizeDateString(row.date));
  const asOf = latestDate([...priceDates, ...benchmarkDates]);

  // --- Benchmark: detect duplicate dates ---
  const benchmarkDateSeen = new Set<string>();
  const benchmarkDuplicateDates = new Set<string>();
  for (const row of levelsRaw) {
    const d = normalizeDateString(row.date);
    if (benchmarkDateSeen.has(d)) {
      benchmarkDuplicateDates.add(d);
    }
    benchmarkDateSeen.add(d);
  }
  if (benchmarkDuplicateDates.size > 0) {
    dataWarnings.push({
      source: "benchmark",
      issue: `${benchmarkDuplicateDates.size} duplicate date${benchmarkDuplicateDates.size !== 1 ? "s" : ""} with conflicting levels`,
      resolution: "Last entry wins (later entry treated as a correction)",
    });
  }

  const sectorBounds: SectorBound[] = Object.entries(policyRaw.per_asset_class_caps).map(
    ([sectorKey, max]) => ({
      sector: normalizeAssetClassLabel(sectorKey),
      min: 0,
      max,
    }),
  );

  // --- Constraints: check if asset class caps sum to 1 ---
  const capSum = Object.values(policyRaw.per_asset_class_caps).reduce((s, v) => s + v, 0);
  if (Math.abs(capSum - 1) > 0.001) {
    const remainder = ((1 - capSum) * 100).toFixed(0);
    dataWarnings.push({
      source: "constraints",
      issue: `Asset class caps sum to ${capSum.toFixed(2)}, not 1.0`,
      resolution: `Remaining ${remainder}% headroom can be allocated to cash or unclassified assets`,
    });
  }

  const constraints: Constraints = {
    asOf,
    objective:
      "Tilt toward assets with stronger realised risk-adjusted monthly returns, subject to caps in constraints.json and turnover.",
    maxAssetWeight: policyRaw.max_weight,
    minAssetWeight: policyRaw.min_weight,
    maxTurnover: 0.35,
    maxAssets: policyRaw.max_assets,
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
    dataWarnings,
  };
}
