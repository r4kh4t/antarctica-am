"use client";

import { useState } from "react";
import type { PortfolioRecommendation } from "@/lib/portfolio/types";
import { PerformanceChart } from "./PerformanceChart";
import { RiskReturnChart } from "./RiskReturnChart";
import { SectorChart } from "./SectorChart";

type Tab = "performance" | "risk-return" | "sectors";

const TABS: { id: Tab; label: string }[] = [
  { id: "performance", label: "Performance" },
  { id: "risk-return", label: "Risk / Return" },
  { id: "sectors", label: "Sectors" },
];

type AnalyticsSectionProps = {
  recommendation: PortfolioRecommendation;
};

export function AnalyticsSection({ recommendation }: AnalyticsSectionProps) {
  const [activeTab, setActiveTab] = useState<Tab>("performance");

  return (
    <section className="rounded-3xl bg-white shadow-sm ring-1 ring-border">
      {/* Header + tabs */}
      <div className="border-b border-border p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-label text-secondary">
              Analytics
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">Portfolio insights</h2>
          </div>
          <div className="flex gap-1.5">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`cursor-pointer rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                  activeTab === tab.id
                    ? "bg-ink text-white"
                    : "bg-surface text-secondary hover:bg-primary-muted"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="p-6">
        {activeTab === "performance" && (
          <PerformanceChart
            assetMonthlyReturns={recommendation.assetMonthlyReturns}
            benchmarkMonthlyReturns={recommendation.benchmarkMonthlyReturns}
            benchmarkName={recommendation.benchmarkName}
            rows={recommendation.rows}
          />
        )}
        {activeTab === "risk-return" && <RiskReturnChart rows={recommendation.rows} />}
        {activeTab === "sectors" && (
          <SectorChart sectorExposures={recommendation.sectorExposures} />
        )}
      </div>
    </section>
  );
}
