import { formatPercent } from "@/lib/portfolio/format";
import type { PortfolioRecommendation } from "@/lib/portfolio/types";

type MethodologyCardProps = {
  recommendation: PortfolioRecommendation;
};

export function MethodologyCard({ recommendation }: MethodologyCardProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">Methodology</p>
        <h2 className="mt-2 text-2xl font-semibold">How the recommendation was produced</h2>
        <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-200">
          {recommendation.methodology.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-sky-300" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
          Soft constraints
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Sector exposure check</h2>
        <div className="mt-5 space-y-4">
          {recommendation.sectorExposures.map((sector) => (
            <div key={sector.sector}>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="font-semibold text-slate-800">{sector.sector}</span>
                <span className="text-slate-500">
                  {formatPercent(sector.recommendedWeight)} target, range{" "}
                  {formatPercent(sector.min, 0)}-{formatPercent(sector.max, 0)}
                </span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-sky-700"
                  style={{ width: `${Math.min(sector.recommendedWeight * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
