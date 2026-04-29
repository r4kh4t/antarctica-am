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

function WeightChartContent({ rows }: WeightChartContentProps) {
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
          cursor={{ fill: "rgba(183, 213, 235, 0.24)" }}
        />
        <Legend />
        <Bar dataKey="current" name="Current" fill="#1F2528" radius={[8, 8, 0, 0]} />
        <Bar dataKey="recommended" name="Recommended" fill="#B7D5EB" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Named export for direct imports (barrel index.ts, tests, etc.)
export { WeightChartContent };
// Default export for next/dynamic — avoids the .then(m => m.Named) chain
// that causes the TS language server to fail module resolution.
export default WeightChartContent;
