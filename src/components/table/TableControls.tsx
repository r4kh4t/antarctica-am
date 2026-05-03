"use client";

import { Tooltip } from "@/components/shared/Tooltip";
import type { MoveFilter, SortDirection, SortKey } from "./types";

type TableControlsProps = {
  query: string;
  onQueryChange: (value: string) => void;
  sectors: string[];
  sectorFilter: string;
  onSectorFilterChange: (value: string) => void;
  moveFilter: MoveFilter;
  onMoveFilterChange: (value: MoveFilter) => void;
  sortKey: SortKey;
  sortDirection: SortDirection;
  onSortChange: (key: SortKey) => void;
  resultCount: number;
  totalCount: number;
  onExport: () => void;
  exportDisabled?: boolean;
};

const MOVE_OPTIONS: { value: MoveFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "increase", label: "Increases" },
  { value: "reduce", label: "Reductions" },
  { value: "hold", label: "Holds" },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "recommendedWeight", label: "Recommended %" },
  { value: "currentWeight", label: "Current %" },
  { value: "weightDelta", label: "Move" },
  { value: "riskAdjustedScore", label: "Score" },
  { value: "ticker", label: "Ticker" },
  { value: "sector", label: "Sector" },
];

function PillGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-label-sm text-secondary/60">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              value === option.value
                ? "bg-ink text-white"
                : "bg-surface text-secondary hover:bg-primary-muted"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function TableControls({
  query,
  onQueryChange,
  sectors,
  sectorFilter,
  onSectorFilterChange,
  moveFilter,
  onMoveFilterChange,
  sortKey,
  sortDirection,
  onSortChange,
  resultCount,
  totalCount,
  onExport,
  exportDisabled = false,
}: TableControlsProps) {
  const sectorOptions = [
    { value: "all", label: "All" },
    ...sectors.map((s) => ({ value: s, label: s })),
  ];

  return (
    <div className="border-b border-border bg-surface/60">
      <div className="grid gap-5 p-5 md:grid-cols-[1.4fr_1fr_1fr] md:p-6">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-label-sm text-secondary/60">
            Search
          </p>
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Asset, sector, rationale…"
            className="w-full rounded-2xl border border-border bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <PillGroup
          label="Sector"
          options={sectorOptions}
          value={sectorFilter}
          onChange={onSectorFilterChange}
        />

        <PillGroup
          label="Direction"
          options={MOVE_OPTIONS}
          value={moveFilter}
          onChange={onMoveFilterChange}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/60 px-5 py-3 md:px-6">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-label-sm text-secondary/60">
            Sort by
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SORT_OPTIONS.map((option) => {
              const isActive = sortKey === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onSortChange(option.value)}
                  className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-primary text-ink"
                      : "bg-surface text-secondary hover:bg-primary-muted"
                  }`}
                  aria-pressed={isActive}
                >
                  {option.label}
                  {isActive ? (sortDirection === "asc" ? " ↑" : " ↓") : ""}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <p className="text-xs text-secondary/60">
            {resultCount === totalCount
              ? `${totalCount} assets`
              : `${resultCount} of ${totalCount} assets`}
          </p>
          <Tooltip
            content="AI is still thinking — export will include full rationale once complete."
            width="w-64"
            disabled={!exportDisabled}
          >
            <button
              type="button"
              onClick={onExport}
              disabled={exportDisabled}
              aria-disabled={exportDisabled}
              className={`flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold transition-colors ${
                exportDisabled
                  ? "cursor-not-allowed opacity-40"
                  : "cursor-pointer hover:bg-primary-subtle hover:text-ink text-secondary"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export CSV
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
