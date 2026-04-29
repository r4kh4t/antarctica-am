"use client";

import { useMemo, useState } from "react";
import { formatPercent, formatScore, formatSignedPercent } from "@/lib/portfolio/format";
import type { RecommendationRow } from "@/lib/portfolio/types";

type RecommendationTableProps = {
  rows: RecommendationRow[];
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

const sortLabels: Record<SortKey, string> = {
  ticker: "Asset",
  sector: "Sector",
  currentWeight: "Current",
  recommendedWeight: "Recommended",
  weightDelta: "Move",
  riskAdjustedScore: "Score",
};

function getSortValue(row: RecommendationRow, sortKey: SortKey) {
  return row[sortKey];
}

function matchesMoveFilter(row: RecommendationRow, moveFilter: MoveFilter) {
  if (moveFilter === "all") {
    return true;
  }

  if (moveFilter === "increase") {
    return row.weightDelta > 0.002;
  }

  if (moveFilter === "reduce") {
    return row.weightDelta < -0.002;
  }

  return Math.abs(row.weightDelta) <= 0.002;
}

export function RecommendationTable({ rows }: RecommendationTableProps) {
  const [query, setQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [moveFilter, setMoveFilter] = useState<MoveFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("recommendedWeight");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const sectors = useMemo(
    () =>
      [...new Set(rows.map((row) => row.sector))].sort((left, right) => left.localeCompare(right)),
    [rows],
  );

  const visibleRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return rows
      .filter((row) => {
        const matchesQuery =
          normalizedQuery.length === 0 ||
          [row.ticker, row.name, row.sector, row.region, row.rationale].some((value) =>
            value.toLowerCase().includes(normalizedQuery),
          );
        const matchesSector = sectorFilter === "all" || row.sector === sectorFilter;

        return matchesQuery && matchesSector && matchesMoveFilter(row, moveFilter);
      })
      .sort((left, right) => {
        const leftValue = getSortValue(left, sortKey);
        const rightValue = getSortValue(right, sortKey);
        const comparison =
          typeof leftValue === "number" && typeof rightValue === "number"
            ? leftValue - rightValue
            : String(leftValue).localeCompare(String(rightValue));

        return sortDirection === "asc" ? comparison : -comparison;
      });
  }, [moveFilter, query, rows, sectorFilter, sortDirection, sortKey]);

  function updateSort(nextSortKey: SortKey) {
    if (nextSortKey === sortKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(nextSortKey);
    setSortDirection(
      nextSortKey === "ticker" || nextSortKey === "sector" || nextSortKey === "weightDelta"
        ? "asc"
        : "desc",
    );
  }

  function sortIndicator(headerSortKey: SortKey) {
    if (headerSortKey !== sortKey) {
      return "↕";
    }

    return sortDirection === "asc" ? "↑" : "↓";
  }

  return (
    <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-[var(--antarctica-line)]">
      <div className="border-b border-[var(--antarctica-line)] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--antarctica-charcoal)]">
          Recommendation
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-[var(--antarctica-ink)]">
          Proposed asset weights
        </h2>
      </div>

      <div className="grid gap-3 border-b border-[var(--antarctica-line)] bg-[var(--antarctica-stone)]/60 p-4 md:grid-cols-[1.3fr_0.9fr_0.9fr_1fr_auto] md:items-end md:p-6">
        <label className="text-sm font-medium text-[var(--antarctica-charcoal)]">
          Search
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Asset, sector, rationale..."
            className="mt-2 w-full rounded-2xl border border-[var(--antarctica-line)] bg-white px-4 py-3 text-sm text-[var(--antarctica-ink)] outline-none transition focus:border-[var(--antarctica-ice)] focus:ring-2 focus:ring-[var(--antarctica-ice)]/40"
          />
        </label>

        <label className="text-sm font-medium text-[var(--antarctica-charcoal)]">
          Sector
          <select
            value={sectorFilter}
            onChange={(event) => setSectorFilter(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-[var(--antarctica-line)] bg-white px-4 py-3 text-sm text-[var(--antarctica-ink)] outline-none transition focus:border-[var(--antarctica-ice)] focus:ring-2 focus:ring-[var(--antarctica-ice)]/40"
          >
            <option value="all">All sectors</option>
            {sectors.map((sector) => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-[var(--antarctica-charcoal)]">
          Move
          <select
            value={moveFilter}
            onChange={(event) => setMoveFilter(event.target.value as MoveFilter)}
            className="mt-2 w-full rounded-2xl border border-[var(--antarctica-line)] bg-white px-4 py-3 text-sm text-[var(--antarctica-ink)] outline-none transition focus:border-[var(--antarctica-ice)] focus:ring-2 focus:ring-[var(--antarctica-ice)]/40"
          >
            <option value="all">All moves</option>
            <option value="increase">Increases</option>
            <option value="reduce">Reductions</option>
            <option value="hold">Holds</option>
          </select>
        </label>

        <label className="text-sm font-medium text-[var(--antarctica-charcoal)]">
          Sort by
          <select
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value as SortKey)}
            className="mt-2 w-full rounded-2xl border border-[var(--antarctica-line)] bg-white px-4 py-3 text-sm text-[var(--antarctica-ink)] outline-none transition focus:border-[var(--antarctica-ice)] focus:ring-2 focus:ring-[var(--antarctica-ice)]/40"
          >
            {Object.entries(sortLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={() => setSortDirection((current) => (current === "asc" ? "desc" : "asc"))}
          className="rounded-2xl border border-[var(--antarctica-line)] bg-white px-4 py-3 text-sm font-semibold text-[var(--antarctica-ink)] transition hover:bg-[var(--antarctica-ice-light)]"
          aria-label={`Sort ${sortDirection === "asc" ? "descending" : "ascending"}`}
        >
          {sortDirection === "asc" ? "Ascending" : "Descending"}
        </button>
      </div>

      <div className="border-b border-[var(--antarctica-line)] px-5 py-3 text-sm text-[var(--antarctica-charcoal)]/70 md:px-6">
        Showing {visibleRows.length} of {rows.length} assets
      </div>

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

            <p className="mt-4 text-sm leading-6 text-[var(--antarctica-charcoal)]/75">
              {row.rationale}
            </p>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-[var(--antarctica-line)] text-sm">
          <thead className="bg-[var(--antarctica-ice-light)] text-left text-xs font-semibold uppercase tracking-wide text-[var(--antarctica-charcoal)]">
            <tr>
              <th className="px-6 py-4">
                <button
                  type="button"
                  onClick={() => updateSort("ticker")}
                  className="font-semibold"
                >
                  Asset {sortIndicator("ticker")}
                </button>
              </th>
              <th className="px-6 py-4">
                <button
                  type="button"
                  onClick={() => updateSort("sector")}
                  className="font-semibold"
                >
                  Sector {sortIndicator("sector")}
                </button>
              </th>
              <th className="px-6 py-4 text-right">
                <button
                  type="button"
                  onClick={() => updateSort("currentWeight")}
                  className="font-semibold"
                >
                  Current {sortIndicator("currentWeight")}
                </button>
              </th>
              <th className="px-6 py-4 text-right">
                <button
                  type="button"
                  onClick={() => updateSort("recommendedWeight")}
                  className="font-semibold"
                >
                  Recommended {sortIndicator("recommendedWeight")}
                </button>
              </th>
              <th className="px-6 py-4 text-right">
                <button
                  type="button"
                  onClick={() => updateSort("weightDelta")}
                  className="font-semibold"
                >
                  Move {sortIndicator("weightDelta")}
                </button>
              </th>
              <th className="px-6 py-4 text-right">
                <button
                  type="button"
                  onClick={() => updateSort("riskAdjustedScore")}
                  className="font-semibold"
                >
                  Score {sortIndicator("riskAdjustedScore")}
                </button>
              </th>
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
                  {row.rationale}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {visibleRows.length === 0 ? (
        <div className="p-8 text-center text-sm text-[var(--antarctica-charcoal)]/70">
          No assets match the current filters.
        </div>
      ) : null}
    </section>
  );
}
