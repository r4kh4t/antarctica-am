import { formatPercent, formatScore, formatSignedPercent } from "@/lib/portfolio/format";
import type { RecommendationRow } from "@/lib/portfolio/types";

type RecommendationTableProps = {
  rows: RecommendationRow[];
};

export function RecommendationTable({ rows }: RecommendationTableProps) {
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

      <div className="divide-y divide-[var(--antarctica-line)] md:hidden">
        {rows.map((row) => (
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
              <th className="px-6 py-4">Asset</th>
              <th className="px-6 py-4">Sector</th>
              <th className="px-6 py-4 text-right">Current</th>
              <th className="px-6 py-4 text-right">Recommended</th>
              <th className="px-6 py-4 text-right">Move</th>
              <th className="px-6 py-4 text-right">Score</th>
              <th className="px-6 py-4">Rationale</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--antarctica-line)] bg-white">
            {rows.map((row) => (
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
    </section>
  );
}
