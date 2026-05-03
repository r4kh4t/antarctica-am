"use client";

import { format } from "date-fns";
import { useEffect, useMemo, useRef, useState } from "react";
import { InfoIcon, Tooltip as HoverTooltip } from "@/components/shared/Tooltip";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AssetMonthlyReturn } from "@/lib/portfolio/types";
import { RECHARTS_INITIAL_DIMENSION } from "@/components/chart/rechartsSizing";

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
  if (!month || month.length < 7) return "";
  const [yearStr, monthStr] = month.slice(0, 7).split("-");
  const year = parseInt(yearStr ?? "", 10);
  const mon = parseInt(monthStr ?? "", 10);
  if (isNaN(year) || isNaN(mon) || mon < 1 || mon > 12) return month;
  // Local date constructor (midnight local time) avoids the UTC→local timezone
  // shift that parseISO would introduce for a UTC midnight date (e.g. UTC-12
  // would roll back one day making April become March).
  return format(new Date(year, mon - 1, 1), "MMM ''yy");
}

type PerformanceChartProps = {
  assetMonthlyReturns: AssetMonthlyReturn[];
  benchmarkMonthlyReturns: { month: string; return: number }[];
  benchmarkName: string;
};

// ─── Fund selector dropdown ────────────────────────────────────────────────

type FundSelectProps = {
  tickers: string[];
  benchmarkName: string;
  tickerColorMap: Record<string, string>;
  hiddenSeries: Set<string>;
  onToggle: (key: string) => void;
};

function CheckIcon() {
  return (
    <svg viewBox="0 0 10 10" className="h-2 w-2" fill="none" stroke="white" strokeWidth="2">
      <path d="M2 5l2.5 2.5L8 3" />
    </svg>
  );
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`h-3.5 w-3.5 shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

function FundSelect({
  tickers,
  benchmarkName,
  tickerColorMap,
  hiddenSeries,
  onToggle,
}: FundSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const allKeys = [...tickers, "__benchmark"];
  const visibleCount = allKeys.filter((k) => !hiddenSeries.has(k)).length;

  const summaryLabel =
    visibleCount === allKeys.length
      ? `All (${allKeys.length})`
      : visibleCount === 0
        ? "None selected"
        : `${visibleCount} of ${allKeys.length}`;

  function showAll() {
    for (const k of allKeys) {
      if (hiddenSeries.has(k)) onToggle(k);
    }
  }

  function hideAll() {
    for (const k of allKeys) {
      if (!hiddenSeries.has(k)) onToggle(k);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-1.5 text-sm font-medium text-secondary shadow-sm transition-colors hover:bg-surface"
      >
        <span>Funds: {summaryLabel}</span>
        <ChevronDown open={open} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-60 overflow-hidden rounded-2xl border border-border bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="text-xs font-semibold uppercase tracking-label-sm text-secondary/55">
              Series
            </span>
            <div className="flex gap-3 text-xs text-secondary/55">
              <button type="button" onClick={showAll} className="hover:text-ink">
                All
              </button>
              <button type="button" onClick={hideAll} className="hover:text-ink">
                None
              </button>
            </div>
          </div>

          {/* Fund rows */}
          <div className="max-h-56 overflow-y-auto py-1">
            {tickers.map((ticker) => {
              const active = !hiddenSeries.has(ticker);
              const color = tickerColorMap[ticker] ?? "#888";
              return (
                <button
                  key={ticker}
                  type="button"
                  onClick={() => onToggle(ticker)}
                  className="flex w-full items-center gap-2.5 px-3 py-1.5 text-sm transition-colors hover:bg-surface"
                >
                  <svg width="16" height="8" className="shrink-0">
                    <line
                      x1="0"
                      y1="4"
                      x2="16"
                      y2="4"
                      stroke={active ? color : "#d8d8d2"}
                      strokeWidth="2"
                    />
                  </svg>
                  <span className={`flex-1 text-left ${active ? "text-ink" : "text-secondary/40"}`}>
                    {ticker}
                  </span>
                  <span
                    className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border ${
                      active ? "border-ink bg-ink" : "border-border bg-white"
                    }`}
                  >
                    {active && <CheckIcon />}
                  </span>
                </button>
              );
            })}

            {/* Benchmark divider + row */}
            <div className="mx-3 my-1 border-t border-border" />
            <button
              type="button"
              onClick={() => onToggle("__benchmark")}
              className="flex w-full items-center gap-2.5 px-3 py-1.5 text-sm transition-colors hover:bg-surface"
            >
              <svg width="16" height="8" className="shrink-0">
                <line
                  x1="0"
                  y1="4"
                  x2="16"
                  y2="4"
                  stroke={!hiddenSeries.has("__benchmark") ? BENCHMARK_COLOR : "#d8d8d2"}
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
              </svg>
              <span
                className={`flex-1 truncate text-left text-xs ${
                  !hiddenSeries.has("__benchmark") ? "text-ink" : "text-secondary/40"
                }`}
                title={benchmarkName}
              >
                Benchmark
              </span>
              <span
                className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border ${
                  !hiddenSeries.has("__benchmark") ? "border-ink bg-ink" : "border-border bg-white"
                }`}
              >
                {!hiddenSeries.has("__benchmark") && <CheckIcon />}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Month range picker

const MONTHS_ABBR = [
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

function MonthRangePicker({
  start,
  end,
  availableMonths,
  onStartChange,
  onEndChange,
}: {
  start: string;
  end: string;
  availableMonths: readonly string[];
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  // null = no pending start yet; string = first click done, waiting for end click
  const [pendingStart, setPendingStart] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setPendingStart(null);
        setHovered(null);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const availableSet = useMemo(() => new Set(availableMonths), [availableMonths]);

  const years = useMemo((): number[] => {
    if (availableMonths.length === 0) return [];
    const ys = availableMonths.map((m) => parseInt(m.slice(0, 4), 10)).filter((y) => !isNaN(y));
    const min = Math.min(...ys);
    const max = Math.max(...ys);
    return Array.from({ length: max - min + 1 }, (_, i) => min + i);
  }, [availableMonths]);

  // Range to highlight: uses hover preview while selecting the end
  const effectiveStart = pendingStart ?? start;
  const effectiveEnd = pendingStart && hovered ? hovered : end;
  const [rangeMin, rangeMax] =
    effectiveStart <= effectiveEnd
      ? [effectiveStart, effectiveEnd]
      : [effectiveEnd, effectiveStart];

  function handleClick(month: string) {
    if (!availableSet.has(month)) return;
    if (!pendingStart) {
      setPendingStart(month);
      setHovered(month);
    } else {
      const [s, e] = month >= pendingStart ? [pendingStart, month] : [month, pendingStart];
      onStartChange(s);
      onEndChange(e);
      setPendingStart(null);
      setHovered(null);
      setOpen(false);
    }
  }

  const triggerLabel =
    start && end ? `${formatMonthLabel(start)} → ${formatMonthLabel(end)}` : "Select range";
  const hint = pendingStart ? "Click end month" : "Click start month";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setPendingStart(null);
          setHovered(null);
        }}
        className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-1.5 text-sm font-medium text-ink shadow-sm transition-colors hover:bg-surface"
      >
        <span className="min-w-36 text-left">{triggerLabel}</span>
        <ChevronDown open={open} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-[420px] max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="text-xs font-semibold uppercase tracking-label-sm text-secondary/60">
              {hint}
            </span>
            <div className="flex items-center gap-3 text-xs text-secondary/50">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-4 rounded-sm bg-primary/40 ring-1 ring-primary/30" />
                in range
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-4 rounded-sm bg-surface ring-1 ring-border" />
                no data
                <HoverTooltip
                  content="These months have no available price data for any holding in the portfolio. Only months with at least one valid price observation are selectable."
                  width="w-60"
                >
                  <InfoIcon className="text-secondary/40 hover:text-secondary" />
                </HoverTooltip>
              </span>
            </div>
          </div>

          {/* Year × month grid */}
          <div className="p-3">
            <div className="mb-1.5 grid grid-cols-[2.5rem_repeat(12,1fr)] gap-0.5 text-center">
              <div />
              {MONTHS_ABBR.map((m) => (
                <div key={m} className="text-xs font-medium text-secondary/50">
                  {m}
                </div>
              ))}
            </div>

            {years.map((year) => (
              <div key={year} className="mb-0.5 grid grid-cols-[2.5rem_repeat(12,1fr)] gap-0.5">
                <div className="flex items-center text-xs font-semibold text-secondary/55">
                  {year}
                </div>
                {MONTHS_ABBR.map((_, idx) => {
                  const monthKey = `${year}-${String(idx + 1).padStart(2, "0")}`;
                  const available = availableSet.has(monthKey);
                  const inRange = monthKey >= rangeMin && monthKey <= rangeMax;
                  const isEdge = monthKey === rangeMin || monthKey === rangeMax;

                  if (!available) {
                    return (
                      <div
                        key={monthKey}
                        className="group relative flex h-7 cursor-not-allowed items-center justify-center rounded bg-surface text-xs text-secondary/25"
                      >
                        {String(idx + 1).padStart(2, "0")}
                        <span className="pointer-events-none absolute bottom-full left-1/2 z-[60] mb-1.5 hidden w-40 -translate-x-1/2 rounded-xl bg-ink px-2.5 py-2 text-xs leading-snug text-white shadow-lg group-hover:block">
                          No price data for this period
                          <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-ink" />
                        </span>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={monthKey}
                      type="button"
                      onClick={() => handleClick(monthKey)}
                      onMouseEnter={() => pendingStart && setHovered(monthKey)}
                      onMouseLeave={() => pendingStart && setHovered(pendingStart)}
                      className={`h-7 w-full text-xs font-medium transition-colors ${
                        isEdge
                          ? "rounded bg-ink text-white"
                          : inRange
                            ? "rounded-none bg-primary/35 text-ink hover:bg-primary/50"
                            : "rounded text-secondary hover:bg-primary-muted"
                      }`}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component

export function PerformanceChart({
  assetMonthlyReturns,
  benchmarkMonthlyReturns,
  benchmarkName,
}: PerformanceChartProps) {
  // allMonths is fully data-driven: adding more daily prices adds more monthly
  // return rows, which extends allMonths and the date-range picker bounds automatically.
  const allMonths = useMemo(() => {
    const months = new Set([
      ...assetMonthlyReturns.map((r) => r.month),
      ...benchmarkMonthlyReturns.map((r) => r.month),
    ]);
    return [...months].sort();
  }, [assetMonthlyReturns, benchmarkMonthlyReturns]);

  const tickers = useMemo(
    () => [...new Set(assetMonthlyReturns.map((r) => r.ticker))].sort(),
    [assetMonthlyReturns],
  );

  // Derived defaults — empty string means "user hasn't changed it; fall back to data boundary"
  const firstMonth = allMonths[0] || "";
  const lastMonth = allMonths[allMonths.length - 1] || "";
  const [userStartMonth, setUserStartMonth] = useState<string>("");
  const [userEndMonth, setUserEndMonth] = useState<string>("");
  // || treats "" as "not set", so the pickers always show the full available range by default
  const startMonth = userStartMonth || firstMonth;
  const endMonth = userEndMonth || lastMonth;

  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const filteredMonths = useMemo(
    () => allMonths.filter((m) => m >= startMonth && m <= endMonth),
    [allMonths, startMonth, endMonth],
  );

  const tickerColorMap = useMemo(
    () => Object.fromEntries(tickers.map((t, i) => [t, LINE_COLORS[i % LINE_COLORS.length]!])),
    [tickers],
  );

  const chartData = useMemo(() => {
    if (filteredMonths.length === 0) return [];

    const returnsByTicker = new Map<string, Map<string, number>>();
    for (const row of assetMonthlyReturns) {
      if (!returnsByTicker.has(row.ticker)) returnsByTicker.set(row.ticker, new Map());
      returnsByTicker.get(row.ticker)!.set(row.month, row.return);
    }
    const benchmarkByMonth = new Map(benchmarkMonthlyReturns.map((r) => [r.month, r.return]));

    const cumulative: Record<string, number> = {};
    for (const ticker of tickers) cumulative[ticker] = 100;
    cumulative["__benchmark"] = 100;

    // "Start" avoids a long duplicate label like "Base (Apr '23)" in the X-axis
    const basePoint: Record<string, number | string> = { month: "Start" };
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

  return (
    <div className="flex flex-col gap-4">
      {/* Controls row */}
      <div className="flex flex-wrap items-end gap-4">
        {/* Date range picker */}
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-label-sm text-secondary/60">
            Date range
          </p>
          <MonthRangePicker
            start={startMonth}
            end={endMonth}
            availableMonths={allMonths}
            onStartChange={setUserStartMonth}
            onEndChange={setUserEndMonth}
          />
        </div>

        {/* Fund selector */}
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-label-sm text-secondary/60">
            Funds
          </p>
          <FundSelect
            tickers={tickers}
            benchmarkName={benchmarkName}
            tickerColorMap={tickerColorMap}
            hiddenSeries={hiddenSeries}
            onToggle={toggleSeries}
          />
        </div>

        <div className="self-end pb-2">
          <p className="text-xs text-secondary/50">Growth of 100 indexed to start of range</p>
          {firstMonth && lastMonth && (
            <p className="mt-0.5 text-xs text-secondary/35">
              Data: {formatMonthLabel(firstMonth)} – {formatMonthLabel(lastMonth)}
            </p>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="h-72 min-h-0 w-full min-w-0">
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={0}
          minHeight={288}
          initialDimension={RECHARTS_INITIAL_DIMENSION}
        >
          <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            {/* Green: above 100 — capital growth */}
            <ReferenceArea y1={100} y2={999} fill="#10B981" fillOpacity={0.13} />
            {/* Amber: below 100 — capital at risk */}
            <ReferenceArea y1={1} y2={100} fill="#F59E0B" fillOpacity={0.16} />

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
              domain={[
                (dataMin: number) => Math.floor(Math.min(dataMin, 97) / 5) * 5,
                (dataMax: number) => Math.ceil(Math.max(dataMax, 103) / 5) * 5,
              ]}
            />
            <ReferenceLine y={100} stroke="#9ca3af" strokeDasharray="4 2" />
            <Tooltip
              formatter={(value, name) => [
                `${Number(value).toFixed(1)}`,
                name === "__benchmark" ? "Benchmark" : String(name),
              ]}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
              contentStyle={{ fontSize: 12, borderRadius: 12, border: "1px solid #d8d8d2" }}
              wrapperStyle={{ zIndex: 40 }}
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
