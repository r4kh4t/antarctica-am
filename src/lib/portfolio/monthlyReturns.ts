import type { BenchmarkPoint, MonthlyReturn, PricePoint } from "./types";

type MonthEndValue = {
  month: string;
  date: string;
  value: number;
};

function monthKey(date: string) {
  return date.slice(0, 7);
}

function toMonthEndValues<T extends { date: string }>(
  rows: T[],
  getValue: (row: T) => number,
): MonthEndValue[] {
  const byMonth = new Map<string, MonthEndValue>();

  for (const row of rows) {
    const month = monthKey(row.date);
    const existing = byMonth.get(month);

    if (!existing || row.date > existing.date) {
      byMonth.set(month, {
        month,
        date: row.date,
        value: getValue(row),
      });
    }
  }

  return [...byMonth.values()].sort((left, right) => left.month.localeCompare(right.month));
}

function returnsFromMonthEnds(values: MonthEndValue[]) {
  const returns: { month: string; return: number }[] = [];

  for (let index = 1; index < values.length; index += 1) {
    const previous = values[index - 1];
    const current = values[index];

    if (!previous || !current || previous.value <= 0) {
      continue;
    }

    returns.push({
      month: current.month,
      return: current.value / previous.value - 1,
    });
  }

  return returns;
}

/**
 * Build the monthly return series with a partial first-month entry.
 *
 * The first entry represents the change from the very first observation to the
 * end of its own month — e.g. benchmark going from 1000.00 on 2023-04-05 to
 * 893.55 on 2023-04-28 registers a -10.65% April return. Subsequent entries
 * are standard month-end / previous-month-end ratios.
 *
 * This matters because a chart indexed to day one shows the true time-weighted
 * return an investor would experience, instead of silently discarding the
 * first partial month's drawdown or gain.
 */
function monthlyReturnsSeries<T extends { date: string }>(
  rows: T[],
  getValue: (row: T) => number,
): { month: string; return: number }[] {
  if (rows.length === 0) return [];

  const firstRow = [...rows].sort((a, b) => a.date.localeCompare(b.date))[0];
  if (!firstRow) return [];
  const firstValue = getValue(firstRow);
  if (!(firstValue > 0)) return [];

  const monthEnds = toMonthEndValues(rows, getValue);
  const firstMonthEnd = monthEnds[0];

  const returns: { month: string; return: number }[] = [];

  // Include the partial first month when the first observation precedes its
  // own month-end (i.e. we have intra-month data for month 0). If the first
  // observation IS the month-end, no synthetic prepend — the "normal" loop
  // below would pick it up on the next month anyway.
  if (firstMonthEnd && firstMonthEnd.date > firstRow.date) {
    returns.push({
      month: firstMonthEnd.month,
      return: firstMonthEnd.value / firstValue - 1,
    });
  }

  returns.push(...returnsFromMonthEnds(monthEnds));
  return returns;
}

export function calculateAssetMonthlyReturns(prices: PricePoint[]): MonthlyReturn[] {
  const byAsset = new Map<string, PricePoint[]>();

  for (const price of prices) {
    const assetPrices = byAsset.get(price.assetId) ?? [];
    assetPrices.push(price);
    byAsset.set(price.assetId, assetPrices);
  }

  return [...byAsset.entries()].flatMap(([assetId, assetPrices]) =>
    monthlyReturnsSeries(assetPrices, (price) => price.close).map((monthlyReturn) => ({
      assetId,
      ...monthlyReturn,
    })),
  );
}

export function calculateBenchmarkMonthlyReturns(levels: BenchmarkPoint[]) {
  return monthlyReturnsSeries(levels, (level) => level.level);
}

export function mean(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function sampleStandardDeviation(values: number[]) {
  if (values.length < 2) {
    return 0;
  }

  const average = mean(values);
  const variance =
    values.reduce((sum, value) => sum + (value - average) ** 2, 0) / (values.length - 1);

  return Math.sqrt(variance);
}
