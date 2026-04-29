import { formatPercent, formatScore, formatSignedPercent } from "@/lib/portfolio/format";
import type { RecommendationRow } from "@/lib/portfolio/types";

function csvCell(value: string | number): string {
  const s = String(value);
  // Wrap in quotes if the value contains commas, quotes, or newlines
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function csvRow(cells: (string | number)[]): string {
  return cells.map(csvCell).join(",");
}

const HEADERS = [
  "Ticker",
  "Name",
  "Asset ID",
  "Sector",
  "Region",
  "Current Weight",
  "Recommended Weight",
  "Move",
  "Risk-Adjusted Score",
  "Rationale",
];

export function exportRowsToCSV(
  rows: RecommendationRow[],
  getRationale: (row: RecommendationRow) => string,
  filename = "antarctica-recommendations.csv",
): void {
  const lines = [
    csvRow(HEADERS),
    ...rows.map((row) =>
      csvRow([
        row.ticker,
        row.name,
        row.assetId,
        row.sector,
        row.region,
        formatPercent(row.currentWeight),
        formatPercent(row.recommendedWeight),
        formatSignedPercent(row.weightDelta),
        formatScore(row.riskAdjustedScore),
        getRationale(row),
      ]),
    ),
  ];

  const blob = new Blob([lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
