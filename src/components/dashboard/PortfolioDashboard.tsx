"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { formatPercent } from "@/lib/portfolio/format";
import type { PortfolioRecommendation } from "@/lib/portfolio/types";
import { AI_STATUS, API_ROUTES } from "@/lib/constants";
import type { AiState } from "@/lib/constants";
import { DataQualitySummary } from "./DataQualitySummary";
import { MethodologyCard } from "./MethodologyCard";
import { RecommendationTable } from "@/components/table";
import { AnalyticsSection, WeightChartContent } from "@/components/chart";
import { Tooltip, InfoIcon } from "@/components/shared/Tooltip";

type PortfolioDashboardProps = {
  recommendation: PortfolioRecommendation;
};

const SUMMARY_TOOLTIPS = {
  expectedReturn: "Weighted average of each asset's mean monthly return at recommended weights.",
  monthlyUplift:
    "Improvement in expected monthly return versus holding the current portfolio unchanged.",
  vsBenchmark:
    "Recommended portfolio expected monthly return minus the benchmark's average monthly return.",
  volatility:
    "Annualised volatility estimated from the portfolio's realised monthly return series at recommended weights (σ × √12).",
  turnover:
    "Sum of absolute weight changes ÷ 2. Lower means fewer trades and lower execution cost.",
  benchmark:
    "Arithmetic average of the benchmark's monthly returns over the available price history.",
  materialChanges: "Count of assets where the absolute weight change is ≥ 0.5 percentage points.",
  constraints:
    "Whether all sector allocations and individual asset limits fall within the soft policy bounds after applying the recommendation.",
};

const SECTOR_STATUS_STYLE: Record<"within" | "below" | "above", string> = {
  within: "bg-emerald-50 text-emerald-700",
  below: "bg-amber-50 text-amber-700",
  above: "bg-red-50 text-red-700",
};

const SECTOR_STATUS_LABEL: Record<"within" | "below" | "above", string> = {
  within: "OK",
  below: "Below min",
  above: "Above max",
};

function SummaryMetric({
  label,
  tooltip,
  value,
  sub,
}: {
  label: string;
  tooltip: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1 text-xs text-white/65">
        <span>{label}</span>
        <Tooltip content={tooltip} width="w-64">
          <InfoIcon className="text-white/40 hover:text-white/70" />
        </Tooltip>
      </dt>
      <dd className="mt-0.5 text-base font-semibold tabular-nums leading-tight">{value}</dd>
      {sub && (
        <dd className="mt-0.5 min-w-0 overflow-hidden break-words text-xs leading-snug text-white/50">
          {sub}
        </dd>
      )}
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

  const sectorInsights = aiState.status === AI_STATUS.LOADED ? aiState.sectorInsights : {};

  return (
    <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
      {/* Header */}
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
                  className="h-12 w-auto"
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

          {/* Decision summary */}
          <div className="rounded-3xl bg-primary/12 p-5 ring-1 ring-primary/30 lg:min-w-0">
            <p className="text-xs font-semibold uppercase tracking-label text-primary">
              Decision summary
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 sm:gap-x-5">
              <SummaryMetric
                label="Expected monthly return"
                tooltip={SUMMARY_TOOLTIPS.expectedReturn}
                value={
                  <span className="text-xl sm:text-2xl">
                    {formatPercent(recommendation.summary.expectedMonthlyReturn, 2)}
                  </span>
                }
              />
              <SummaryMetric
                label="Monthly uplift vs current"
                tooltip={SUMMARY_TOOLTIPS.monthlyUplift}
                value={<span className="text-lg">{formatPercent(monthlyLift, 2)}</span>}
                sub={`From ${formatPercent(recommendation.summary.currentExpectedMonthlyReturn, 2)} current`}
              />
              <SummaryMetric
                label="Excess vs benchmark (monthly)"
                tooltip={SUMMARY_TOOLTIPS.vsBenchmark}
                value={formatPercent(vsBenchmarkMonthly, 2)}
                sub="Portfolio expected minus benchmark avg"
              />
              <SummaryMetric
                label="Annualised volatility proxy"
                tooltip={SUMMARY_TOOLTIPS.volatility}
                value={formatPercent(recommendation.summary.expectedAnnualizedVolatility)}
              />
              <SummaryMetric
                label="One-way turnover"
                tooltip={SUMMARY_TOOLTIPS.turnover}
                value={formatPercent(recommendation.summary.turnover)}
              />
              <SummaryMetric
                label="Benchmark (avg monthly)"
                tooltip={SUMMARY_TOOLTIPS.benchmark}
                value={formatPercent(recommendation.summary.benchmarkAverageMonthlyReturn, 2)}
                sub={recommendation.benchmarkName}
              />
              <SummaryMetric
                label="Material weight changes"
                tooltip={SUMMARY_TOOLTIPS.materialChanges}
                value={
                  <>
                    {materialRebalanceCount}
                    <span className="text-sm font-normal text-white/55">
                      {" "}
                      / {recommendation.rows.length}
                    </span>
                  </>
                }
              />
              <SummaryMetric
                label="Constraint status"
                tooltip={SUMMARY_TOOLTIPS.constraints}
                value={
                  <span className="text-sm leading-snug">
                    {recommendation.summary.constraintStatus}
                  </span>
                }
              />
            </dl>
          </div>
        </div>
      </header>

      {/* Data Quality + Constraint Compliance */}
      <div className="mt-6">
        <DataQualitySummary
          warnings={recommendation.dataWarnings}
          constraintCompliance={recommendation.constraintCompliance}
        />
      </div>

      {/* Allocation + Constraints | Methodology */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.55fr_1fr]">
        {/* Combined Allocation + Constraints card */}
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-border">
          {/* Allocation */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-label text-secondary">
              Allocation
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">Current vs recommended weights</h2>
          </div>
          <div className="mt-4 h-72 min-h-0 w-full min-w-0">
            <WeightChartContent rows={recommendation.rows} />
          </div>

          <div className="my-6 border-t border-border" />

          {/* Soft constraints */}
          <div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold uppercase tracking-label text-secondary">
                Soft constraints
              </p>
              {aiState.status === AI_STATUS.LOADING && (
                <span className="h-1.5 w-1.5 animate-ping rounded-full bg-primary" />
              )}
            </div>
            <h2 className="mt-2 text-lg font-semibold text-ink">Sector exposure check</h2>
            <div className="mt-4 space-y-3">
              {recommendation.sectorExposures.map((sector) => {
                const insight = sectorInsights[sector.sector];
                return (
                  <div key={sector.sector}>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span className="flex items-center gap-1.5 font-medium text-secondary">
                        {sector.sector}
                        {insight && (
                          <Tooltip content={insight} width="w-64">
                            <InfoIcon className="text-secondary/40 hover:text-secondary" />
                          </Tooltip>
                        )}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${SECTOR_STATUS_STYLE[sector.status]}`}
                        >
                          {SECTOR_STATUS_LABEL[sector.status]}
                        </span>
                        <span className="text-xs text-secondary/55">
                          {formatPercent(sector.recommendedWeight)} · range{" "}
                          {formatPercent(sector.min, 0)}–{formatPercent(sector.max, 0)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-primary-subtle">
                      <div
                        className="h-1.5 rounded-full bg-primary"
                        style={{ width: `${Math.min(sector.recommendedWeight * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Methodology */}
        <MethodologyCard recommendation={recommendation} />
      </div>

      {/* Analytics */}
      <div className="mt-8">
        <AnalyticsSection recommendation={recommendation} />
      </div>

      {/* Recommendation table */}
      <div className="mt-8">
        <RecommendationTable recommendation={recommendation} aiState={aiState} />
      </div>

      <footer className="mt-12 border-t border-border pb-8 pt-6 text-center text-xs text-secondary/45">
        <p className="font-medium text-secondary/60">Antarctica Portfolio Recommendation</p>
        <p className="mt-1">
          © 2026 Rakhat Shakimbekov &nbsp;·&nbsp; Senior Next.js take-home assignment
        </p>
        <p className="mt-1">
          For questions, contact{" "}
          <a
            href="mailto:rahateamfor@gmail.com"
            className="underline underline-offset-2 transition-colors hover:text-secondary"
          >
            rahateamfor@gmail.com
          </a>
        </p>
      </footer>
    </main>
  );
}
