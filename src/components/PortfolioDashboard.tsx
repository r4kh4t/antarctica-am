import Image from "next/image";
import { formatPercent } from "@/lib/portfolio/format";
import type { PortfolioRecommendation } from "@/lib/portfolio/types";
import { MethodologyCard } from "./MethodologyCard";
import { RecommendationTable } from "./RecommendationTable";
import { WeightChart } from "./WeightChart";

type PortfolioDashboardProps = {
  recommendation: PortfolioRecommendation;
};

function KpiCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{detail}</p>
    </div>
  );
}

export function PortfolioDashboard({ recommendation }: PortfolioDashboardProps) {
  const monthlyLift =
    recommendation.summary.expectedMonthlyReturn -
    recommendation.summary.currentExpectedMonthlyReturn;

  return (
    <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
      <header className="overflow-hidden rounded-[2rem] bg-slate-950 shadow-sm">
        <div className="grid gap-8 p-8 text-white lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
          <div>
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-white p-3">
                <Image
                  src="/assets/antarctica-logo.svg"
                  alt="Antarctica Asset Management"
                  width={150}
                  height={48}
                  priority
                />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">
                  Portfolio recommendation
                </p>
                <p className="mt-1 text-sm text-slate-300">As of {recommendation.asOf}</p>
              </div>
            </div>
            <h1 className="mt-8 max-w-3xl text-4xl font-semibold tracking-tight lg:text-5xl">
              Tilt toward stronger risk-adjusted monthly returns while respecting soft business
              constraints.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
              {recommendation.objective} This recommendation is designed to be explainable in a
              stakeholder debrief rather than hidden behind a black-box optimiser.
            </p>
          </div>
          <div className="rounded-3xl bg-white/10 p-6 ring-1 ring-white/15">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">
              Decision summary
            </p>
            <dl className="mt-5 space-y-5">
              <div>
                <dt className="text-sm text-slate-300">Expected monthly return</dt>
                <dd className="mt-1 text-3xl font-semibold">
                  {formatPercent(recommendation.summary.expectedMonthlyReturn, 2)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-slate-300">Monthly uplift vs current portfolio</dt>
                <dd className="mt-1 text-2xl font-semibold">{formatPercent(monthlyLift, 2)}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-300">Constraint status</dt>
                <dd className="mt-1 text-lg font-semibold">
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
        <MethodologyCard recommendation={recommendation} />
      </div>

      <div className="mt-8">
        <RecommendationTable rows={recommendation.rows} />
      </div>
    </main>
  );
}
