"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatPercent } from "@/lib/portfolio/format";
import type { RecommendationRow } from "@/lib/portfolio/types";

type WeightChartContentProps = {
  rows: RecommendationRow[];
};

type SeriesToggleProps = {
  color: string;
  label: string;
  active: boolean;
  onToggle: () => void;
};

function SeriesToggle({ color, label, active, onToggle }: SeriesToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? "bg-ink/8 text-ink ring-1 ring-ink/20"
          : "bg-surface text-secondary/40 ring-1 ring-border"
      }`}
    >
      <span
        className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
        style={{ background: active ? color : "#d8d8d2" }}
      />
      {label}
    </button>
  );
}

export function WeightChartContent({ rows }: WeightChartContentProps) {
  const [showCurrent, setShowCurrent] = useState(true);
  const [showRecommended, setShowRecommended] = useState(true);

  const chartData = [...rows]
    .sort((left, right) => left.ticker.localeCompare(right.ticker))
    .map((row) => ({
      ticker: row.ticker,
      current: row.currentWeight,
      recommended: row.recommendedWeight,
    }));

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <SeriesToggle
          color="#1F2528"
          label="Current"
          active={showCurrent}
          onToggle={() => setShowCurrent((v) => !v)}
        />
        <SeriesToggle
          color="#B7D5EB"
          label="Recommended"
          active={showRecommended}
          onToggle={() => setShowRecommended((v) => !v)}
        />
      </div>

      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="ticker" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <YAxis
              tickFormatter={(value) => formatPercent(Number(value), 0)}
              tickLine={false}
              axisLine={false}
              width={48}
            />
            <Tooltip
              formatter={(value, name) => [
                formatPercent(Number(value)),
                name === "current" ? "Current" : "Recommended",
              ]}
              cursor={{ fill: "rgba(183, 213, 235, 0.24)" }}
            />
            {showCurrent && (
              <Bar dataKey="current" name="Current" fill="#1F2528" radius={[6, 6, 0, 0]} />
            )}
            {showRecommended && (
              <Bar dataKey="recommended" name="Recommended" fill="#B7D5EB" radius={[6, 6, 0, 0]} />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
