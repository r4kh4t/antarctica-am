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

export function calculateAssetMonthlyReturns(prices: PricePoint[]): MonthlyReturn[] {
  const byAsset = new Map<string, PricePoint[]>();

  for (const price of prices) {
    const assetPrices = byAsset.get(price.assetId) ?? [];
    assetPrices.push(price);
    byAsset.set(price.assetId, assetPrices);
  }

  return [...byAsset.entries()].flatMap(([assetId, assetPrices]) =>
    returnsFromMonthEnds(toMonthEndValues(assetPrices, (price) => price.close)).map(
      (monthlyReturn) => ({
        assetId,
        ...monthlyReturn,
      }),
    ),
  );
}

export function calculateBenchmarkMonthlyReturns(levels: BenchmarkPoint[]) {
  return returnsFromMonthEnds(toMonthEndValues(levels, (level) => level.level));
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
