type MoveFilter = "all" | "increase" | "reduce" | "hold";

type SortKey =
  | "ticker"
  | "sector"
  | "currentWeight"
  | "recommendedWeight"
  | "weightDelta"
  | "riskAdjustedScore";

type SortDirection = "asc" | "desc";

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
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-(--antarctica-charcoal)/60">
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
                ? "bg-(--antarctica-ink) text-white"
                : "bg-(--antarctica-stone) text-(--antarctica-charcoal) hover:bg-(--antarctica-ice-muted)"
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
}: TableControlsProps) {
  const sectorOptions = [
    { value: "all", label: "All" },
    ...sectors.map((s) => ({ value: s, label: s })),
  ];

  return (
    <div className="border-b border-(--antarctica-line) bg-(--antarctica-stone)/60">
      <div className="grid gap-5 p-5 md:grid-cols-[1.4fr_1fr_1fr] md:p-6">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-(--antarctica-charcoal)/60">
            Search
          </p>
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Asset, sector, rationale…"
            className="w-full rounded-2xl border border-(--antarctica-line) bg-white px-4 py-2.5 text-sm text-(--antarctica-ink) outline-none transition focus:border-(--antarctica-ice) focus:ring-2 focus:ring-(--antarctica-ice)/40"
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

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-(--antarctica-line)/60 px-5 py-3 md:px-6">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-(--antarctica-charcoal)/60">
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
                      ? "bg-(--antarctica-ice) text-(--antarctica-ink)"
                      : "bg-(--antarctica-stone) text-(--antarctica-charcoal) hover:bg-(--antarctica-ice-muted)"
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

        <p className="text-xs text-(--antarctica-charcoal)/60">
          {resultCount === totalCount
            ? `${totalCount} assets`
            : `${resultCount} of ${totalCount} assets`}
        </p>
      </div>
    </div>
  );
}
