"use client";

import type { RecommendationRow } from "@/lib/portfolio/types";
import { WeightChartContent } from "./WeightChartContent";

type WeightChartProps = {
  rows: RecommendationRow[];
};

export function WeightChart({ rows }: WeightChartProps) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-border">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-label text-secondary">Allocation</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">Current vs recommended weights</h2>
      </div>
      <div className="h-80">
        <WeightChartContent rows={rows} />
      </div>
    </section>
  );
}
