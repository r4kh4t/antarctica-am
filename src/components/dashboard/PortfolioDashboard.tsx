"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { formatPercent } from "@/lib/portfolio/format";
import type { PortfolioRecommendation } from "@/lib/portfolio/types";
import { AI_STATUS, API_ROUTES } from "@/lib/constants";
import type { AiState } from "@/lib/constants";
import { MethodologyCard } from "./MethodologyCard";
import { RecommendationTable } from "@/components/table";
import { AnalyticsSection, WeightChart } from "@/components/chart";

type PortfolioDashboardProps = {
  recommendation: PortfolioRecommendation;
};

function KpiCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-border">
      <p className="text-sm font-medium text-secondary/65">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-ink">{value}</p>
      <p className="mt-2 text-sm leading-6 text-secondary/65">{detail}</p>
    </div>
  );
}

export function PortfolioDashboard({ recommendation }: PortfolioDashboardProps) {
  const [aiState, setAiState] = useState<AiState>({ status: AI_STATUS.LOADING });

  useEffect(() => {
    async function fetchAi() {
      try {
        const res = await fetch(API_ROUTES.RATIONALE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rows: recommendation.rows.map((r) => ({
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
              rationale: r.rationale,
            })),
            sectorExposures: recommendation.sectorExposures,
            summary: {
              expectedMonthlyReturn: recommendation.summary.expectedMonthlyReturn,
              currentExpectedMonthlyReturn: recommendation.summary.currentExpectedMonthlyReturn,
              expectedAnnualizedVolatility: recommendation.summary.expectedAnnualizedVolatility,
              turnover: recommendation.summary.turnover,
              benchmarkAverageMonthlyReturn: recommendation.summary.benchmarkAverageMonthlyReturn,
            },
            benchmarkName: recommendation.benchmarkName,
            asOf: recommendation.asOf,
          }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        setAiState({
          status: AI_STATUS.LOADED,
          rationale: data.rationale ?? {},
          narrative: data.narrative ?? "",
          sectorInsights: data.sectorInsights ?? {},
        });
      } catch (err) {
        console.error("[PortfolioDashboard] AI fetch failed:", err);
        setAiState({ status: AI_STATUS.ERROR });
      }
    }

    fetchAi();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const monthlyLift =
    recommendation.summary.expectedMonthlyReturn -
    recommendation.summary.currentExpectedMonthlyReturn;

  const vsBenchmarkMonthly =
    recommendation.summary.expectedMonthlyReturn -
    recommendation.summary.benchmarkAverageMonthlyReturn;

  const materialRebalanceCount = recommendation.rows.filter(
    (r) => Math.abs(r.weightDelta) >= 0.005,
  ).length;

  return (
    <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
      <header className="overflow-hidden rounded-4xl bg-ink shadow-sm">
        <div className="grid gap-8 p-8 text-white lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
          <div>
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-surface p-3">
                <Image
                  src="/assets/antarctica-logo.svg"
                  alt="Antarctica Asset Management"
                  width={150}
                  height={48}
                  priority
                />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-label-lg text-primary">
                  Portfolio recommendation
                </p>
                <p className="mt-1 text-sm text-white/70">As of {recommendation.asOf}</p>
              </div>
            </div>
            <h1 className="mt-8 max-w-3xl text-4xl font-semibold tracking-tight lg:text-5xl">
              Tilt toward stronger risk-adjusted monthly returns while respecting soft business
              constraints.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/72">
              {recommendation.objective} This recommendation is designed to be explainable in a
              stakeholder debrief rather than hidden behind a black-box optimiser.
            </p>
          </div>
          <div className="rounded-3xl bg-primary/12 p-5 ring-1 ring-primary/30 lg:min-w-0">
            <p className="text-xs font-semibold uppercase tracking-label text-primary">
              Decision summary
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:gap-x-5">
              <div className="min-w-0">
                <dt className="text-xs text-white/65">Expected monthly return</dt>
                <dd className="mt-0.5 text-xl font-semibold tabular-nums leading-tight sm:text-2xl">
                  {formatPercent(recommendation.summary.expectedMonthlyReturn, 2)}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs text-white/65">Monthly uplift vs current</dt>
                <dd className="mt-0.5 text-lg font-semibold tabular-nums leading-tight">
                  {formatPercent(monthlyLift, 2)}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs text-white/65">Excess vs benchmark (monthly)</dt>
                <dd className="mt-0.5 text-base font-semibold tabular-nums leading-tight">
                  {formatPercent(vsBenchmarkMonthly, 2)}
                </dd>
                <dd className="mt-0.5 text-xs leading-snug text-white/50">
                  Portfolio expected minus benchmark average
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs text-white/65">Annualised volatility proxy</dt>
                <dd className="mt-0.5 text-base font-semibold tabular-nums leading-tight">
                  {formatPercent(recommendation.summary.expectedAnnualizedVolatility)}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs text-white/65">One-way turnover</dt>
                <dd className="mt-0.5 text-base font-semibold tabular-nums leading-tight">
                  {formatPercent(recommendation.summary.turnover)}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs text-white/65">Benchmark (avg monthly)</dt>
                <dd className="mt-0.5 text-base font-semibold tabular-nums leading-tight">
                  {formatPercent(recommendation.summary.benchmarkAverageMonthlyReturn, 2)}
                </dd>
                <dd
                  className="mt-0.5 truncate text-xs text-white/50"
                  title={recommendation.benchmarkName}
                >
                  {recommendation.benchmarkName}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs text-white/65">Material weight changes</dt>
                <dd className="mt-0.5 text-base font-semibold tabular-nums leading-tight">
                  {materialRebalanceCount}
                  <span className="text-sm font-normal text-white/55">
                    {" "}
                    / {recommendation.rows.length}
                  </span>
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs text-white/65">Constraint status</dt>
                <dd className="mt-0.5 text-base font-semibold leading-snug">
                  {recommendation.summary.constraintStatus}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </header>

      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Expected monthly return"
          value={formatPercent(recommendation.summary.expectedMonthlyReturn, 2)}
          detail={`Current portfolio estimate: ${formatPercent(
            recommendation.summary.currentExpectedMonthlyReturn,
            2,
          )}`}
        />
        <KpiCard
          label="Annualized volatility proxy"
          value={formatPercent(recommendation.summary.expectedAnnualizedVolatility)}
          detail="Based on realised monthly return series after applying recommended weights."
        />
        <KpiCard
          label="One-way turnover"
          value={formatPercent(recommendation.summary.turnover)}
          detail="Kept inside the soft turnover budget to avoid over-trading."
        />
        <KpiCard
          label="Benchmark monthly return"
          value={formatPercent(recommendation.summary.benchmarkAverageMonthlyReturn, 2)}
          detail={recommendation.benchmarkName}
        />
      </section>

      <div className="mt-8 grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <WeightChart rows={recommendation.rows} />
        <MethodologyCard recommendation={recommendation} aiState={aiState} />
      </div>

      <div className="mt-8">
        <AnalyticsSection recommendation={recommendation} />
      </div>

      <div className="mt-8">
        <RecommendationTable recommendation={recommendation} aiState={aiState} />
      </div>
    </main>
  );
}
