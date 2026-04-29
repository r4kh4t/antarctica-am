"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AssetMonthlyReturn } from "@/lib/portfolio/types";

const LINE_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#F97316",
  "#6366F1",
  "#84CC16",
];

const BENCHMARK_COLOR = "#1F2528";

function formatMonthLabel(month: string): string {
  const [year, monthNum] = month.split("-");
  const names = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${names[parseInt(monthNum ?? "1") - 1]} '${year?.slice(2)}`;
}

type PerformanceChartProps = {
  assetMonthlyReturns: AssetMonthlyReturn[];
  benchmarkMonthlyReturns: { month: string; return: number }[];
  benchmarkName: string;
};

type SeriesPillProps = {
  color: string;
  label: string;
  active: boolean;
  onToggle: () => void;
  dashed?: boolean;
};

function SeriesPill({ color, label, active, onToggle, dashed }: SeriesPillProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
        active ? "bg-ink/6 text-ink ring-1 ring-ink/15" : "text-secondary/40 ring-1 ring-border"
      }`}
    >
      <svg width="16" height="8" aria-hidden="true">
        {dashed ? (
          <line
            x1="0"
            y1="4"
            x2="16"
            y2="4"
            stroke={active ? color : "#d8d8d2"}
            strokeWidth="2"
            strokeDasharray="3 2"
          />
        ) : (
          <line x1="0" y1="4" x2="16" y2="4" stroke={active ? color : "#d8d8d2"} strokeWidth="2" />
        )}
      </svg>
      {label}
    </button>
  );
}

export function PerformanceChart({
  assetMonthlyReturns,
  benchmarkMonthlyReturns,
  benchmarkName,
}: PerformanceChartProps) {
  const tickers = useMemo(
    () => [...new Set(assetMonthlyReturns.map((r) => r.ticker))].sort(),
    [assetMonthlyReturns],
  );

  const allMonths = useMemo(() => {
    const months = new Set([
      ...assetMonthlyReturns.map((r) => r.month),
      ...benchmarkMonthlyReturns.map((r) => r.month),
    ]);
    return [...months].sort();
  }, [assetMonthlyReturns, benchmarkMonthlyReturns]);

  const [startMonth, setStartMonth] = useState(allMonths[0] ?? "");
  const [endMonth, setEndMonth] = useState(allMonths[allMonths.length - 1] ?? "");

  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const filteredMonths = useMemo(
    () => allMonths.filter((m) => m >= startMonth && m <= endMonth),
    [allMonths, startMonth, endMonth],
  );

  const chartData = useMemo(() => {
    if (filteredMonths.length === 0) return [];

    // Build return lookup maps
    const returnsByTicker = new Map<string, Map<string, number>>();
    for (const row of assetMonthlyReturns) {
      if (!returnsByTicker.has(row.ticker)) returnsByTicker.set(row.ticker, new Map());
      returnsByTicker.get(row.ticker)!.set(row.month, row.return);
    }
    const benchmarkByMonth = new Map(benchmarkMonthlyReturns.map((r) => [r.month, r.return]));

    // Cumulative values — start at 100 before the first month
    const cumulative: Record<string, number> = {};
    for (const ticker of tickers) cumulative[ticker] = 100;
    cumulative["__benchmark"] = 100;

    // Add a synthetic base point
    const baseLabel = `Base (${formatMonthLabel(filteredMonths[0] ?? "")})`;
    const basePoint: Record<string, number | string> = { month: baseLabel };
    for (const ticker of tickers) basePoint[ticker] = 100;
    basePoint["__benchmark"] = 100;

    const result: Record<string, number | string>[] = [basePoint];

    for (const month of filteredMonths) {
      const point: Record<string, number | string> = { month: formatMonthLabel(month) };
      for (const ticker of tickers) {
        const r = returnsByTicker.get(ticker)?.get(month) ?? 0;
        cumulative[ticker] = parseFloat((cumulative[ticker]! * (1 + r)).toFixed(3));
        point[ticker] = cumulative[ticker];
      }
      const benchR = benchmarkByMonth.get(month) ?? 0;
      cumulative["__benchmark"] = parseFloat(
        (cumulative["__benchmark"]! * (1 + benchR)).toFixed(3),
      );
      point["__benchmark"] = cumulative["__benchmark"];
      result.push(point);
    }

    return result;
  }, [filteredMonths, tickers, assetMonthlyReturns, benchmarkMonthlyReturns]);

  function toggleSeries(key: string) {
    setHiddenSeries((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const tickerColorMap = useMemo(
    () => Object.fromEntries(tickers.map((t, i) => [t, LINE_COLORS[i % LINE_COLORS.length]!])),
    [tickers],
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Date range pickers */}
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-label-sm text-secondary/60">
            From
          </p>
          <input
            type="month"
            value={startMonth}
            min={allMonths[0]}
            max={endMonth}
            onChange={(e) => setStartMonth(e.target.value)}
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-label-sm text-secondary/60">
            To
          </p>
          <input
            type="month"
            value={endMonth}
            min={startMonth}
            max={allMonths[allMonths.length - 1]}
            onChange={(e) => setEndMonth(e.target.value)}
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <p className="text-xs text-secondary/50">
          Growth of 100 indexed to the start of the selected range
        </p>
      </div>

      {/* Series toggles */}
      <div className="flex flex-wrap gap-1.5">
        {tickers.map((ticker) => (
          <SeriesPill
            key={ticker}
            color={tickerColorMap[ticker] ?? "#888"}
            label={ticker}
            active={!hiddenSeries.has(ticker)}
            onToggle={() => toggleSeries(ticker)}
          />
        ))}
        <SeriesPill
          color={BENCHMARK_COLOR}
          label={benchmarkName}
          active={!hiddenSeries.has("__benchmark")}
          onToggle={() => toggleSeries("__benchmark")}
          dashed
        />
      </div>

      {/* Chart */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e0" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={52}
              tickFormatter={(v) => v.toFixed(0)}
              domain={["auto", "auto"]}
            />
            <ReferenceLine y={100} stroke="#d8d8d2" strokeDasharray="4 2" />
            <Tooltip
              formatter={(value, name) => [
                `${Number(value).toFixed(1)}`,
                name === "__benchmark" ? benchmarkName : String(name),
              ]}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
              contentStyle={{ fontSize: 12, borderRadius: 12, border: "1px solid #d8d8d2" }}
            />
            {tickers.map((ticker) => (
              <Line
                key={ticker}
                type="monotone"
                dataKey={ticker}
                stroke={tickerColorMap[ticker]}
                strokeWidth={1.5}
                dot={false}
                hide={hiddenSeries.has(ticker)}
                activeDot={{ r: 4 }}
              />
            ))}
            <Line
              type="monotone"
              dataKey="__benchmark"
              name={benchmarkName}
              stroke={BENCHMARK_COLOR}
              strokeWidth={2}
              strokeDasharray="5 3"
              dot={false}
              hide={hiddenSeries.has("__benchmark")}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
