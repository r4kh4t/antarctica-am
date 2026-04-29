"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatPercent, formatScore, formatSignedPercent } from "@/lib/portfolio/format";
import type { PortfolioRecommendation, RecommendationRow } from "@/lib/portfolio/types";
import { TextLineSkeleton } from "@/components/shared/Skeleton";
import { TableControls } from "./TableControls";

type RecommendationTableProps = {
  recommendation: PortfolioRecommendation;
};

type SortKey =
  | "ticker"
  | "sector"
  | "currentWeight"
  | "recommendedWeight"
  | "weightDelta"
  | "riskAdjustedScore";

type SortDirection = "asc" | "desc";

type MoveFilter = "all" | "increase" | "reduce" | "hold";

type AiState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "loaded"; rationale: Record<string, string>; narrative: string }
  | { status: "error" };

function getSortValue(row: RecommendationRow, key: SortKey) {
  return row[key];
}

function matchesMoveFilter(row: RecommendationRow, filter: MoveFilter) {
  if (filter === "all") return true;
  if (filter === "increase") return row.weightDelta > 0.002;
  if (filter === "reduce") return row.weightDelta < -0.002;
  return Math.abs(row.weightDelta) <= 0.002;
}

export function RecommendationTable({ recommendation }: RecommendationTableProps) {
  const { rows, summary, benchmarkName, asOf } = recommendation;

  const [query, setQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [moveFilter, setMoveFilter] = useState<MoveFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("recommendedWeight");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [aiState, setAiState] = useState<AiState>({ status: "loading" });

  useEffect(() => {
    async function fetchRationale() {
      try {
        const res = await fetch("/api/rationale", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rows: rows.map((r) => ({
              assetId: r.assetId,
              ticker: r.ticker,
              name: r.name,
              sector: r.sector,
              region: r.region,
              currentWeight: r.currentWeight,
              recommendedWeight: r.recommendedWeight,
              weightDelta: r.weightDelta,
              averageMonthlyReturn: r.averageMonthlyReturn,
              annualizedVolatility: r.annualizedVolatility,
              riskAdjustedScore: r.riskAdjustedScore,
            })),
            summary: {
              expectedMonthlyReturn: summary.expectedMonthlyReturn,
              currentExpectedMonthlyReturn: summary.currentExpectedMonthlyReturn,
              expectedAnnualizedVolatility: summary.expectedAnnualizedVolatility,
              turnover: summary.turnover,
              benchmarkAverageMonthlyReturn: summary.benchmarkAverageMonthlyReturn,
            },
            benchmarkName,
            asOf,
          }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        setAiState({ status: "loaded", rationale: data.rationale, narrative: data.narrative });
      } catch (err) {
        console.error("[RecommendationTable] AI rationale fetch failed:", err);
        setAiState({ status: "error" });
      }
    }

    fetchRationale();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const sectors = useMemo(
    () => [...new Set(rows.map((r) => r.sector))].sort((a, b) => a.localeCompare(b)),
    [rows],
  );

  const visibleRows = useMemo(() => {
    const q = query.trim().toLowerCase();

    return rows
      .filter((row) => {
        const matchesQuery =
          q.length === 0 ||
          [row.ticker, row.name, row.sector, row.region, row.rationale].some((v) =>
            v.toLowerCase().includes(q),
          );
        const matchesSector = sectorFilter === "all" || row.sector === sectorFilter;
        return matchesQuery && matchesSector && matchesMoveFilter(row, moveFilter);
      })
      .sort((a, b) => {
        const av = getSortValue(a, sortKey);
        const bv = getSortValue(b, sortKey);
        const cmp =
          typeof av === "number" && typeof bv === "number"
            ? av - bv
            : String(av).localeCompare(String(bv));
        return sortDirection === "asc" ? cmp : -cmp;
      });
  }, [moveFilter, query, rows, sectorFilter, sortDirection, sortKey]);

  const handleSortChange = useCallback(
    (key: SortKey) => {
      if (key === sortKey) {
        setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDirection(key === "ticker" || key === "sector" ? "asc" : "desc");
      }
    },
    [sortKey],
  );

  function getRationale(row: RecommendationRow): string {
    if (aiState.status === "loaded") {
      return aiState.rationale[row.assetId] ?? row.rationale;
    }
    return row.rationale;
  }

  function sortIndicator(key: SortKey) {
    if (key !== sortKey) return "↕";
    return sortDirection === "asc" ? "↑" : "↓";
  }

  const isLoadingAi = aiState.status === "loading";

  return (
    <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-[var(--antarctica-line)]">
      <div className="border-b border-[var(--antarctica-line)] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--antarctica-charcoal)]">
              Recommendation
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--antarctica-ink)]">
              Proposed asset weights
            </h2>
          </div>
          {isLoadingAi && (
            <div className="flex items-center gap-2 rounded-full bg-[var(--antarctica-ice-light)] px-3 py-1.5 text-xs font-semibold text-[var(--antarctica-charcoal)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--antarctica-ice)] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--antarctica-ice)]" />
              </span>
              AI analysis in progress
            </div>
          )}
          {aiState.status === "loaded" && (
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              AI-enhanced
            </span>
          )}
        </div>

        {aiState.status === "loaded" && aiState.narrative && (
          <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--antarctica-charcoal)]/80 italic">
            {aiState.narrative}
          </p>
        )}
        {isLoadingAi && (
          <div className="mt-4 max-w-3xl">
            <TextLineSkeleton lines={2} />
          </div>
        )}
      </div>

      <TableControls
        query={query}
        onQueryChange={setQuery}
        sectors={sectors}
        sectorFilter={sectorFilter}
        onSectorFilterChange={setSectorFilter}
        moveFilter={moveFilter}
        onMoveFilterChange={setMoveFilter}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        resultCount={visibleRows.length}
        totalCount={rows.length}
      />

      {/* Mobile cards */}
      <div className="divide-y divide-[var(--antarctica-line)] md:hidden">
        {visibleRows.map((row) => (
          <article key={row.assetId} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-[var(--antarctica-ink)]">{row.ticker}</h3>
                <p className="mt-1 text-sm leading-6 text-[var(--antarctica-charcoal)]/70">
                  {row.name}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold ${
                  row.weightDelta >= 0
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-700"
                }`}
              >
                {formatSignedPercent(row.weightDelta)}
              </span>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-[var(--antarctica-ice-light)] p-3">
                <dt className="text-[var(--antarctica-charcoal)]/60">Current</dt>
                <dd className="mt-1 font-semibold text-[var(--antarctica-charcoal)]">
                  {formatPercent(row.currentWeight)}
                </dd>
              </div>
              <div className="rounded-2xl bg-[var(--antarctica-ice-light)] p-3">
                <dt className="text-[var(--antarctica-charcoal)]/60">Recommended</dt>
                <dd className="mt-1 font-semibold text-[var(--antarctica-ink)]">
                  {formatPercent(row.recommendedWeight)}
                </dd>
              </div>
              <div className="rounded-2xl bg-[var(--antarctica-stone)] p-3">
                <dt className="text-[var(--antarctica-charcoal)]/60">Sector</dt>
                <dd className="mt-1 font-semibold text-[var(--antarctica-charcoal)]">
                  {row.sector}
                </dd>
              </div>
              <div className="rounded-2xl bg-[var(--antarctica-stone)] p-3">
                <dt className="text-[var(--antarctica-charcoal)]/60">Score</dt>
                <dd className="mt-1 font-semibold text-[var(--antarctica-charcoal)]">
                  {formatScore(row.riskAdjustedScore)}
                </dd>
              </div>
            </dl>

            <div className="mt-4 text-sm leading-6 text-[var(--antarctica-charcoal)]/75">
              {isLoadingAi ? <TextLineSkeleton lines={3} /> : <p>{getRationale(row)}</p>}
            </div>
          </article>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-[var(--antarctica-line)] text-sm">
          <thead className="bg-[var(--antarctica-ice-light)] text-left text-xs font-semibold uppercase tracking-wide text-[var(--antarctica-charcoal)]">
            <tr>
              {(
                [
                  ["ticker", "Asset"],
                  ["sector", "Sector"],
                ] as [SortKey, string][]
              ).map(([key, label]) => (
                <th key={key} className="px-6 py-4">
                  <button
                    type="button"
                    onClick={() => handleSortChange(key)}
                    className="cursor-pointer font-semibold hover:text-[var(--antarctica-ink)] transition-colors"
                  >
                    {label} {sortIndicator(key)}
                  </button>
                </th>
              ))}
              {(
                [
                  ["currentWeight", "Current"],
                  ["recommendedWeight", "Recommended"],
                  ["weightDelta", "Move"],
                  ["riskAdjustedScore", "Score"],
                ] as [SortKey, string][]
              ).map(([key, label]) => (
                <th key={key} className="px-6 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => handleSortChange(key)}
                    className="cursor-pointer font-semibold hover:text-[var(--antarctica-ink)] transition-colors"
                  >
                    {label} {sortIndicator(key)}
                  </button>
                </th>
              ))}
              <th className="px-6 py-4">Rationale</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--antarctica-line)] bg-white">
            {visibleRows.map((row) => (
              <tr key={row.assetId} className="align-top">
                <td className="px-6 py-4">
                  <div className="font-semibold text-[var(--antarctica-ink)]">{row.ticker}</div>
                  <div className="mt-1 min-w-48 text-[var(--antarctica-charcoal)]/65">
                    {row.name}
                  </div>
                </td>
                <td className="px-6 py-4 text-[var(--antarctica-charcoal)]">{row.sector}</td>
                <td className="px-6 py-4 text-right font-medium text-[var(--antarctica-charcoal)]">
                  {formatPercent(row.currentWeight)}
                </td>
                <td className="px-6 py-4 text-right font-semibold text-[var(--antarctica-ink)]">
                  {formatPercent(row.recommendedWeight)}
                </td>
                <td
                  className={`px-6 py-4 text-right font-semibold ${
                    row.weightDelta >= 0 ? "text-emerald-700" : "text-rose-700"
                  }`}
                >
                  {formatSignedPercent(row.weightDelta)}
                </td>
                <td className="px-6 py-4 text-right text-[var(--antarctica-charcoal)]">
                  {formatScore(row.riskAdjustedScore)}
                </td>
                <td className="max-w-sm px-6 py-4 leading-6 text-[var(--antarctica-charcoal)]/75">
                  {isLoadingAi ? <TextLineSkeleton lines={3} /> : getRationale(row)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {visibleRows.length === 0 && (
        <div className="p-8 text-center text-sm text-[var(--antarctica-charcoal)]/70">
          No assets match the current filters.
        </div>
      )}
    </section>
  );
}
