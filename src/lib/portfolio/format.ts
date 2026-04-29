export function formatPercent(value: number, digits = 1) {
  return new Intl.NumberFormat("en-GB", {
    style: "percent",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatSignedPercent(value: number, digits = 1) {
  const formatted = formatPercent(Math.abs(value), digits);

  if (Math.abs(value) < 0.00001) {
    return formatted;
  }

  return `${value > 0 ? "+" : "-"}${formatted}`;
}

export function formatScore(value: number) {
  return new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
