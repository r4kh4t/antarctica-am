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
import type { AssetMonthlyReturn, RecommendationRow } from "@/lib/portfolio/types";
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
const CURRENT_PORTFOLIO_COLOR = "#F59E0B";
const RECOMMENDED_PORTFOLIO_COLOR = "#10B981";

// Special series keys
const KEY_BENCHMARK = "__benchmark";
const KEY_CURRENT = "__current_portfolio";
const KEY_RECOMMENDED = "__recommended_portfolio";

function formatMonthLabel(month: string): string {
  if (!month || month.length < 7) return "";
  const [yearStr, monthStr] = month.slice(0, 7).split("-");
  const year = parseInt(yearStr ?? "", 10);
  const mon = parseInt(monthStr ?? "", 10);
  if (isNaN(year) || isNaN(mon) || mon < 1 || mon > 12) return month;
  return format(new Date(year, mon - 1, 1), "MMM ''yy");
}

type PerformanceChartProps = {
  assetMonthlyReturns: AssetMonthlyReturn[];
  benchmarkMonthlyReturns: { month: string; return: number }[];
  benchmarkName: string;
  /** Recommendation rows; if omitted the Current/Recommended aggregate lines will simply stay flat at 100. */
  rows?: RecommendationRow[];
};

// ─── Shared icons ────────────────────────────────────────────────────────────

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

// ─── Reusable row inside a dropdown ──────────────────────────────────────────

function DropdownRow({
  active,
  onClick,
  legend,
  label,
  sublabel,
}: {
  active: boolean;
  onClick: () => void;
  legend: React.ReactNode;
  label: string;
  sublabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 px-3 py-1.5 text-sm transition-colors hover:bg-surface"
    >
      <span className="shrink-0">{legend}</span>
      <span className={`flex-1 text-left ${active ? "text-ink" : "text-secondary/40"}`}>
        {label}
        {sublabel && (
          <span className="block text-[10px] text-secondary/40 leading-tight">{sublabel}</span>
        )}
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
}

function LineLegend({
  color,
  dashed = false,
  active,
}: {
  color: string;
  dashed?: boolean;
  active: boolean;
}) {
  return (
    <svg width="16" height="8" className="shrink-0">
      <line
        x1="0"
        y1="4"
        x2="16"
        y2="4"
        stroke={active ? color : "#d8d8d2"}
        strokeWidth="2"
        strokeDasharray={dashed ? "4 2" : undefined}
      />
    </svg>
  );
}

// ─── Fund selector dropdown ───────────────────────────────────────────────────

type FundSelectProps = {
  tickers: string[];
  benchmarkName: string;
  tickerColorMap: Record<string, string>;
  hiddenSeries: Set<string>;
  onToggle: (key: string) => void;
};

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

  const allKeys = [KEY_BENCHMARK, ...tickers];
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

          <div className="max-h-64 overflow-y-auto py-1">
            {/* Benchmark — always first */}
            <DropdownRow
              active={!hiddenSeries.has(KEY_BENCHMARK)}
              onClick={() => onToggle(KEY_BENCHMARK)}
              legend={
                <LineLegend
                  color={BENCHMARK_COLOR}
                  dashed
                  active={!hiddenSeries.has(KEY_BENCHMARK)}
                />
              }
              label="Benchmark"
              sublabel={benchmarkName.length > 30 ? benchmarkName.slice(0, 28) + "…" : undefined}
            />

            <div className="mx-3 my-1 border-t border-border" />

            {/* Individual fund tickers */}
            {tickers.map((ticker) => (
              <DropdownRow
                key={ticker}
                active={!hiddenSeries.has(ticker)}
                onClick={() => onToggle(ticker)}
                legend={
                  <LineLegend
                    color={tickerColorMap[ticker] ?? "#888"}
                    active={!hiddenSeries.has(ticker)}
                  />
                }
                label={ticker}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Portfolio series dropdown ────────────────────────────────────────────────

type PortfolioSelectProps = {
  hiddenSeries: Set<string>;
  onToggle: (key: string) => void;
  benchmarkName: string;
};

const PORTFOLIO_SERIES = [
  {
    key: KEY_BENCHMARK,
    label: "Benchmark",
    color: BENCHMARK_COLOR,
    dashed: true,
  },
  {
    key: KEY_CURRENT,
    label: "Current Portfolio",
    sublabel: "Weighted at current weights",
    color: CURRENT_PORTFOLIO_COLOR,
    dashed: false,
  },
  {
    key: KEY_RECOMMENDED,
    label: "Recommended",
    sublabel: "Weighted at recommended weights",
    color: RECOMMENDED_PORTFOLIO_COLOR,
    dashed: false,
  },
] as const;

function PortfolioSelect({ hiddenSeries, onToggle }: PortfolioSelectProps) {
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

  const visibleCount = PORTFOLIO_SERIES.filter((s) => !hiddenSeries.has(s.key)).length;

  const summaryLabel =
    visibleCount === PORTFOLIO_SERIES.length
      ? `All (${PORTFOLIO_SERIES.length})`
      : visibleCount === 0
        ? "None"
        : `${visibleCount} of ${PORTFOLIO_SERIES.length}`;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-1.5 text-sm font-medium text-secondary shadow-sm transition-colors hover:bg-surface"
      >
        <span>Portfolio: {summaryLabel}</span>
        <ChevronDown open={open} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-64 overflow-hidden rounded-2xl border border-border bg-white shadow-xl">
          <div className="border-b border-border px-3 py-2">
            <span className="text-xs font-semibold uppercase tracking-label-sm text-secondary/55">
              Aggregated Series
            </span>
          </div>
          <div className="py-1">
            {PORTFOLIO_SERIES.map((s) => (
              <DropdownRow
                key={s.key}
                active={!hiddenSeries.has(s.key)}
                onClick={() => onToggle(s.key)}
                legend={
                  <LineLegend color={s.color} dashed={s.dashed} active={!hiddenSeries.has(s.key)} />
                }
                label={s.label}
                sublabel={"sublabel" in s ? s.sublabel : undefined}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Month range picker ───────────────────────────────────────────────────────

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
        <div className="absolute left-0 top-full z-50 mt-1.5 w-105 max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-white shadow-xl">
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
                        <span className="pointer-events-none absolute bottom-full left-1/2 z-60 mb-1.5 hidden w-40 -translate-x-1/2 rounded-xl bg-ink px-2.5 py-2 text-xs leading-snug text-white shadow-lg group-hover:block">
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

// ─── Main component ───────────────────────────────────────────────────────────

export function PerformanceChart({
  assetMonthlyReturns,
  benchmarkMonthlyReturns,
  benchmarkName,
  rows = [],
}: PerformanceChartProps) {
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

  const firstMonth = allMonths[0] || "";
  const lastMonth = allMonths[allMonths.length - 1] || "";
  const [userStartMonth, setUserStartMonth] = useState<string>("");
  const [userEndMonth, setUserEndMonth] = useState<string>("");
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

    // Index returns by ticker for individual fund lines
    const returnsByTicker = new Map<string, Map<string, number>>();
    for (const row of assetMonthlyReturns) {
      if (!returnsByTicker.has(row.ticker)) returnsByTicker.set(row.ticker, new Map());
      returnsByTicker.get(row.ticker)!.set(row.month, row.return);
    }

    // Index returns by assetId for portfolio aggregates
    const returnsByAssetId = new Map<string, Map<string, number>>();
    for (const row of assetMonthlyReturns) {
      if (!returnsByAssetId.has(row.assetId)) returnsByAssetId.set(row.assetId, new Map());
      returnsByAssetId.get(row.assetId)!.set(row.month, row.return);
    }

    const benchmarkByMonth = new Map(benchmarkMonthlyReturns.map((r) => [r.month, r.return]));

    const cumulative: Record<string, number> = {};
    for (const ticker of tickers) cumulative[ticker] = 100;
    cumulative[KEY_BENCHMARK] = 100;
    cumulative[KEY_CURRENT] = 100;
    cumulative[KEY_RECOMMENDED] = 100;

    const basePoint: Record<string, number | string> = { month: "Start" };
    for (const ticker of tickers) basePoint[ticker] = 100;
    basePoint[KEY_BENCHMARK] = 100;
    basePoint[KEY_CURRENT] = 100;
    basePoint[KEY_RECOMMENDED] = 100;

    const result: Record<string, number | string>[] = [basePoint];

    for (const month of filteredMonths) {
      const point: Record<string, number | string> = { month: formatMonthLabel(month) };

      // Individual tickers
      for (const ticker of tickers) {
        const r = returnsByTicker.get(ticker)?.get(month) ?? 0;
        cumulative[ticker] = parseFloat((cumulative[ticker]! * (1 + r)).toFixed(3));
        point[ticker] = cumulative[ticker];
      }

      // Benchmark
      const benchR = benchmarkByMonth.get(month) ?? 0;
      cumulative[KEY_BENCHMARK] = parseFloat(
        (cumulative[KEY_BENCHMARK]! * (1 + benchR)).toFixed(3),
      );
      point[KEY_BENCHMARK] = cumulative[KEY_BENCHMARK];

      // Current portfolio aggregate (weighted sum of returns at current weights)
      const currentR = rows.reduce((sum, row) => {
        const r = returnsByAssetId.get(row.assetId)?.get(month) ?? 0;
        return sum + row.currentWeight * r;
      }, 0);
      cumulative[KEY_CURRENT] = parseFloat((cumulative[KEY_CURRENT]! * (1 + currentR)).toFixed(3));
      point[KEY_CURRENT] = cumulative[KEY_CURRENT];

      // Recommended portfolio aggregate
      const recommendedR = rows.reduce((sum, row) => {
        const r = returnsByAssetId.get(row.assetId)?.get(month) ?? 0;
        return sum + row.recommendedWeight * r;
      }, 0);
      cumulative[KEY_RECOMMENDED] = parseFloat(
        (cumulative[KEY_RECOMMENDED]! * (1 + recommendedR)).toFixed(3),
      );
      point[KEY_RECOMMENDED] = cumulative[KEY_RECOMMENDED];

      result.push(point);
    }

    return result;
  }, [filteredMonths, tickers, assetMonthlyReturns, benchmarkMonthlyReturns, rows]);

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
      <div className="flex flex-wrap items-end gap-3">
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

        {/* Portfolio series selector */}
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-label-sm text-secondary/60">
            Portfolio
          </p>
          <PortfolioSelect
            hiddenSeries={hiddenSeries}
            onToggle={toggleSeries}
            benchmarkName={benchmarkName}
          />
        </div>

        {/* Individual fund selector */}
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
          <p className="text-xs text-secondary/50">Cumulative return (%) vs start of range</p>
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
            <ReferenceArea y1={100} y2={999} fill="#10B981" fillOpacity={0.13} />
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
              tickFormatter={(v) => {
                const pct = v - 100;
                const sign = pct > 0 ? "+" : "";
                return `${sign}${pct.toFixed(0)}%`;
              }}
              domain={[
                (dataMin: number) => Math.floor(Math.min(dataMin, 97) / 5) * 5,
                (dataMax: number) => Math.ceil(Math.max(dataMax, 103) / 5) * 5,
              ]}
            />
            <ReferenceLine y={100} stroke="#9ca3af" strokeDasharray="4 2" />
            <Tooltip
              formatter={(value, name) => {
                const label =
                  name === KEY_BENCHMARK
                    ? "Benchmark"
                    : name === KEY_CURRENT
                      ? "Current Portfolio"
                      : name === KEY_RECOMMENDED
                        ? "Recommended"
                        : String(name);
                const raw = Number(value);
                const pct = raw - 100;
                const sign = pct > 0 ? "+" : "";
                // Show both: indexed value (100 = start) and cumulative return as a signed percent
                return [`${raw.toFixed(2)}  (${sign}${pct.toFixed(2)}%)`, label];
              }}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
              contentStyle={{ fontSize: 12, borderRadius: 12, border: "1px solid #d8d8d2" }}
              wrapperStyle={{ zIndex: 40 }}
            />

            {/* Individual fund lines */}
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

            {/* Benchmark */}
            <Line
              type="monotone"
              dataKey={KEY_BENCHMARK}
              name="Benchmark"
              stroke={BENCHMARK_COLOR}
              strokeWidth={2}
              strokeDasharray="5 3"
              dot={false}
              hide={hiddenSeries.has(KEY_BENCHMARK)}
              activeDot={{ r: 4 }}
            />

            {/* Current portfolio aggregate */}
            <Line
              type="monotone"
              dataKey={KEY_CURRENT}
              name="Current Portfolio"
              stroke={CURRENT_PORTFOLIO_COLOR}
              strokeWidth={2.5}
              dot={false}
              hide={hiddenSeries.has(KEY_CURRENT)}
              activeDot={{ r: 5 }}
            />

            {/* Recommended portfolio aggregate */}
            <Line
              type="monotone"
              dataKey={KEY_RECOMMENDED}
              name="Recommended"
              stroke={RECOMMENDED_PORTFOLIO_COLOR}
              strokeWidth={2.5}
              dot={false}
              hide={hiddenSeries.has(KEY_RECOMMENDED)}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
