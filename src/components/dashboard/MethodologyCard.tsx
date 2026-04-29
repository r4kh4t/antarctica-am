import { formatPercent } from "@/lib/portfolio/format";
import type { PortfolioRecommendation } from "@/lib/portfolio/types";
import { AI_STATUS } from "@/lib/constants";
import type { AiState } from "@/lib/constants";
import { Tooltip, InfoIcon } from "@/components/shared/Tooltip";

type MethodologyCardProps = {
  recommendation: PortfolioRecommendation;
  aiState: AiState;
};

export function MethodologyCard({ recommendation, aiState }: MethodologyCardProps) {
  const sectorInsights = aiState.status === AI_STATUS.LOADED ? aiState.sectorInsights : {};

  return (
    <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-3xl bg-ink p-6 text-white shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Methodology</p>
        <h2 className="mt-2 text-2xl font-semibold">How the recommendation was produced</h2>
        <ul className="mt-5 space-y-3 text-sm leading-6 text-white/78">
          {recommendation.methodology.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-border">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary">
            Soft constraints
          </p>
          {aiState.status === AI_STATUS.LOADING && (
            <span className="h-1.5 w-1.5 animate-ping rounded-full bg-primary" />
          )}
        </div>
        <h2 className="mt-2 text-2xl font-semibold text-ink">Sector exposure check</h2>
        <div className="mt-5 space-y-4">
          {recommendation.sectorExposures.map((sector) => {
            const insight = sectorInsights[sector.sector];
            return (
              <div key={sector.sector}>
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="flex items-center gap-1.5 font-semibold text-secondary">
                    {sector.sector}
                    {insight && (
                      <Tooltip content={insight} width="w-64">
                        <InfoIcon className="text-secondary/40 hover:text-secondary" />
                      </Tooltip>
                    )}
                  </span>
                  <span className="text-secondary/65">
                    {formatPercent(sector.recommendedWeight)} target, range{" "}
                    {formatPercent(sector.min, 0)}-{formatPercent(sector.max, 0)}
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-primary-subtle">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${Math.min(sector.recommendedWeight * 100, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
