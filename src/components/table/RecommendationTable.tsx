"use client";

import { useCallback, useMemo, useState } from "react";
import { formatPercent, formatScore, formatSignedPercent } from "@/lib/portfolio/format";
import type { PortfolioRecommendation, RecommendationRow } from "@/lib/portfolio/types";
import type { AiState } from "@/components/dashboard/PortfolioDashboard";
import { TextLineSkeleton } from "@/components/shared/Skeleton";
import { Tooltip, InfoIcon } from "@/components/shared/Tooltip";
import { InlineMarkdown } from "@/components/shared/InlineMarkdown";
import { TableControls } from "./TableControls";

type RecommendationTableProps = {
  recommendation: PortfolioRecommendation;
  aiState: AiState;
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

function getSortValue(row: RecommendationRow, key: SortKey) {
  return row[key];
}

function matchesMoveFilter(row: RecommendationRow, filter: MoveFilter) {
  if (filter === "all") return true;
  if (filter === "increase") return row.weightDelta > 0.002;
  if (filter === "reduce") return row.weightDelta < -0.002;
  return Math.abs(row.weightDelta) <= 0.002;
}

type RationaleResult = { text: string; source: "ai" | "algo" };

export function RecommendationTable({ recommendation, aiState }: RecommendationTableProps) {
  const { rows } = recommendation;

  const [query, setQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [moveFilter, setMoveFilter] = useState<MoveFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("recommendedWeight");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const isLoadingAi = aiState.status === "loading";

  function getRationale(row: RecommendationRow): RationaleResult {
    if (aiState.status === "loaded") {
      const aiText = aiState.rationale[row.assetId];
      if (aiText && aiText.trim().length > 0) {
        return { text: aiText, source: "ai" };
      }
    }
    return { text: row.rationale, source: "algo" };
  }

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

  function sortIndicator(key: SortKey) {
    if (key !== sortKey) return "↕";
    return sortDirection === "asc" ? "↑" : "↓";
  }

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
            <InlineMarkdown text={aiState.narrative} />
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
        {visibleRows.map((row) => {
          const rationale = getRationale(row);
          return (
            <article key={row.assetId} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--antarctica-ink)]">
                    {row.ticker}
                  </h3>
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
                {isLoadingAi ? (
                  <TextLineSkeleton lines={3} />
                ) : (
                  <RationaleContent rationale={rationale} />
                )}
              </div>
            </article>
          );
        })}
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
                    className="cursor-pointer font-semibold transition-colors hover:text-[var(--antarctica-ink)]"
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
                    className="cursor-pointer font-semibold transition-colors hover:text-[var(--antarctica-ink)]"
                  >
                    {label} {sortIndicator(key)}
                  </button>
                </th>
              ))}
              <th className="px-6 py-4">Rationale</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--antarctica-line)] bg-white">
            {visibleRows.map((row) => {
              const rationale = getRationale(row);
              return (
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
                    {isLoadingAi ? (
                      <TextLineSkeleton lines={3} />
                    ) : (
                      <RationaleContent rationale={rationale} />
                    )}
                  </td>
                </tr>
              );
            })}
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

function RationaleContent({ rationale }: { rationale: RationaleResult }) {
  return (
    <span>
      <InlineMarkdown text={rationale.text} />
      {rationale.source === "algo" && (
        <Tooltip
          content="Algorithmic rationale — this asset's commentary was generated by the scoring model, not the AI analyst."
          width="w-64"
        >
          <InfoIcon className="ml-1.5 text-[var(--antarctica-charcoal)]/35 hover:text-[var(--antarctica-charcoal)]/70" />
        </Tooltip>
      )}
    </span>
  );
}
