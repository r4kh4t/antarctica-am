import { formatPercent, formatScore, formatSignedPercent } from "@/lib/portfolio/format";
import type { RecommendationRow } from "@/lib/portfolio/types";

type RecommendationTableProps = {
  rows: RecommendationRow[];
};

export function RecommendationTable({ rows }: RecommendationTableProps) {
  return (
    <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="border-b border-slate-200 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
          Recommendation
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Proposed asset weights</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
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
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.map((row) => (
              <tr key={row.assetId} className="align-top">
                <td className="px-6 py-4">
                  <div className="font-semibold text-slate-950">{row.ticker}</div>
                  <div className="mt-1 min-w-48 text-slate-500">{row.name}</div>
                </td>
                <td className="px-6 py-4 text-slate-600">{row.sector}</td>
                <td className="px-6 py-4 text-right font-medium text-slate-700">
                  {formatPercent(row.currentWeight)}
                </td>
                <td className="px-6 py-4 text-right font-semibold text-slate-950">
                  {formatPercent(row.recommendedWeight)}
                </td>
                <td
                  className={`px-6 py-4 text-right font-semibold ${
                    row.weightDelta >= 0 ? "text-emerald-700" : "text-rose-700"
                  }`}
                >
                  {formatSignedPercent(row.weightDelta)}
                </td>
                <td className="px-6 py-4 text-right text-slate-700">
                  {formatScore(row.riskAdjustedScore)}
                </td>
                <td className="max-w-sm px-6 py-4 leading-6 text-slate-600">{row.rationale}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
