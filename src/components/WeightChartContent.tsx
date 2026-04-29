"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatPercent } from "@/lib/portfolio/format";
import type { RecommendationRow } from "@/lib/portfolio/types";

type WeightChartContentProps = {
  rows: RecommendationRow[];
};

export function WeightChartContent({ rows }: WeightChartContentProps) {
  const chartData = [...rows]
    .sort((left, right) => left.ticker.localeCompare(right.ticker))
    .map((row) => ({
      ticker: row.ticker,
      current: row.currentWeight,
      recommended: row.recommendedWeight,
    }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="ticker" tickLine={false} axisLine={false} />
        <YAxis
          tickFormatter={(value) => formatPercent(Number(value), 0)}
          tickLine={false}
          axisLine={false}
          width={48}
        />
        <Tooltip
          formatter={(value) => formatPercent(Number(value))}
          cursor={{ fill: "rgba(14, 165, 233, 0.08)" }}
        />
        <Legend />
        <Bar dataKey="current" name="Current" fill="#94a3b8" radius={[8, 8, 0, 0]} />
        <Bar dataKey="recommended" name="Recommended" fill="#0369a1" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
