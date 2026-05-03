"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatPercent } from "@/lib/portfolio/format";
import type { SectorExposure } from "@/lib/portfolio/types";
import { RECHARTS_INITIAL_DIMENSION } from "@/components/chart/rechartsSizing";

const STATUS_COLOR: Record<SectorExposure["status"], string> = {
  within: "#10B981",
  below: "#F59E0B",
  above: "#EF4444",
};

type SectorChartProps = {
  sectorExposures: SectorExposure[];
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

export function SectorChart({ sectorExposures }: SectorChartProps) {
  const [showCurrent, setShowCurrent] = useState(true);
  const [showRecommended, setShowRecommended] = useState(true);

  const chartData = sectorExposures.map((s) => ({
    sector: s.sector,
    current: s.currentWeight,
    recommended: s.recommendedWeight,
    min: s.min,
    max: s.max,
    status: s.status,
  }));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
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
        <div className="flex flex-wrap gap-2 text-xs">
          {(["within", "below", "above"] as SectorExposure["status"][]).map((status) => (
            <span key={status} className="flex items-center gap-1 text-secondary/60">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: STATUS_COLOR[status] }}
              />
              {status === "within" ? "Within band" : status === "below" ? "Below min" : "Above max"}
            </span>
          ))}
        </div>
      </div>

      <div className="h-64 min-h-0 w-full min-w-0">
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={0}
          minHeight={256}
          initialDimension={RECHARTS_INITIAL_DIMENSION}
        >
          <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e0" />
            <XAxis dataKey="sector" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <YAxis
              tickFormatter={(v) => formatPercent(Number(v), 0)}
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
              wrapperStyle={{ zIndex: 40 }}
            />
            {/* Constraint range reference lines per bar — drawn via a second chart overlay trick
                Recharts doesn't support per-bar reference areas, so we indicate status
                via the bar colour of the recommended bar instead */}
            {chartData.map((entry) => (
              <ReferenceLine
                key={`max-${entry.sector}`}
                y={entry.max}
                stroke={STATUS_COLOR[entry.status]}
                strokeDasharray="4 2"
                strokeOpacity={0.5}
              />
            ))}
            {showCurrent && (
              <Bar dataKey="current" name="Current" radius={[6, 6, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.sector} fill="#1F2528" />
                ))}
              </Bar>
            )}
            {showRecommended && (
              <Bar dataKey="recommended" name="Recommended" radius={[6, 6, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell
                    key={entry.sector}
                    fill={entry.status === "within" ? "#B7D5EB" : STATUS_COLOR[entry.status]}
                    fillOpacity={entry.status === "within" ? 1 : 0.75}
                  />
                ))}
              </Bar>
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-secondary/50">
        Dashed lines show the constraint ceiling per sector. Coloured bars flag breaches.
      </p>
    </div>
  );
}
