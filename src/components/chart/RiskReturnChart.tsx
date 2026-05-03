"use client";

import {
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { formatPercent } from "@/lib/portfolio/format";
import type { RecommendationRow } from "@/lib/portfolio/types";
import { RECHARTS_INITIAL_DIMENSION } from "@/components/chart/rechartsSizing";

// Colors assigned per sector (deterministic from sorted sector list)
const SECTOR_PALETTE = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#F97316",
];

type RiskReturnChartProps = {
  rows: RecommendationRow[];
};

type ScatterPoint = {
  assetId: string;
  ticker: string;
  name: string;
  sector: string;
  volatility: number;
  annualizedReturn: number;
  recommendedWeight: number;
  sectorColor: string;
};

type TooltipEntry = { payload?: ScatterPoint };

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipEntry[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;

  return (
    <div className="rounded-xl border border-border bg-white px-3 py-2.5 text-xs shadow-lg">
      <p className="font-semibold text-ink">
        {d.ticker} — {d.name}
      </p>
      <p className="mt-1 text-secondary/70">{d.sector}</p>
      <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
        <dt className="text-secondary/60">Ann. Return</dt>
        <dd className="font-medium text-ink">{formatPercent(d.annualizedReturn)}</dd>
        <dt className="text-secondary/60">Ann. Volatility</dt>
        <dd className="font-medium text-ink">{formatPercent(d.volatility)}</dd>
        <dt className="text-secondary/60">Rec. Weight</dt>
        <dd className="font-medium text-ink">{formatPercent(d.recommendedWeight)}</dd>
      </dl>
    </div>
  );
}

export function RiskReturnChart({ rows }: RiskReturnChartProps) {
  const sectors = [...new Set(rows.map((r) => r.sector))].sort();
  const sectorColorMap = Object.fromEntries(
    sectors.map((s, i) => [s, SECTOR_PALETTE[i % SECTOR_PALETTE.length]!]),
  );

  const scatterData: ScatterPoint[] = rows.map((row) => ({
    assetId: row.assetId,
    ticker: row.ticker,
    name: row.name,
    sector: row.sector,
    volatility: row.annualizedVolatility,
    annualizedReturn: (1 + row.averageMonthlyReturn) ** 12 - 1,
    recommendedWeight: row.recommendedWeight,
    sectorColor: sectorColorMap[row.sector] ?? "#B7D5EB",
  }));

  return (
    <div className="flex flex-col gap-4">
      {/* Sector legend */}
      <div className="flex flex-wrap gap-2">
        {sectors.map((sector) => (
          <span
            key={sector}
            className="flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-secondary ring-1 ring-border"
          >
            <span
              className="inline-block h-2 w-2 shrink-0 rounded-full"
              style={{ background: sectorColorMap[sector] }}
            />
            {sector}
          </span>
        ))}
      </div>

      {/* Scatter chart */}
      <div className="h-72 min-h-0 w-full min-w-0">
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={0}
          minHeight={288}
          initialDimension={RECHARTS_INITIAL_DIMENSION}
        >
          <ScatterChart margin={{ top: 8, right: 24, left: 0, bottom: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e0" />
            <XAxis
              type="number"
              dataKey="volatility"
              name="Volatility"
              tickFormatter={(v) => formatPercent(v, 0)}
              tickLine={false}
              axisLine={false}
              label={{
                value: "Annualised Volatility →",
                position: "insideBottom",
                offset: -10,
                fontSize: 10,
                fill: "#6b7280",
              }}
            />
            <YAxis
              type="number"
              dataKey="annualizedReturn"
              name="Return"
              tickFormatter={(v) => formatPercent(v, 0)}
              tickLine={false}
              axisLine={false}
              width={52}
              label={{
                value: "Ann. Return →",
                angle: -90,
                position: "insideLeft",
                offset: 12,
                fontSize: 10,
                fill: "#6b7280",
              }}
            />
            {/* Bubble size encodes recommended weight */}
            <ZAxis type="number" dataKey="recommendedWeight" range={[40, 320]} />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ strokeDasharray: "3 3" }}
              wrapperStyle={{ zIndex: 40 }}
            />
            <Scatter data={scatterData} fillOpacity={0.85}>
              {scatterData.map((entry) => (
                <Cell key={entry.assetId} fill={entry.sectorColor} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-secondary/50">Bubble size reflects recommended weight.</p>
    </div>
  );
}
