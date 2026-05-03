# Recommendation Methodology

## Objective (engineering choice)

The brief asks for optimisation on **monthly returns** but does not fix an objective. This implementation uses a **Sharpe-like ranking**: annualised sample mean of monthly returns divided by annualised sample volatility of those same monthly returns. Proposed weights tilt **from the current book** toward higher-ranked names, then **soft constraints** reshape the vector.

Why not full Markowitz mean–variance here: the brief rewards transparency and testability; a covariance-based QP would need stronger assumptions on a thin monthly sample and is harder to defend line-by-line in a debrief.

## Monthly returns (definition)

1. Build a **month-end price** for each calendar month using the **last available daily close** in that month (per asset).
2. Month-on-month return is **arithmetic**: `r = P(end)/P(prev) - 1`. Log returns would reorder ranks only slightly for typical equity ranges; arithmetic matches stakeholder reporting.
3. Annualised return uses compound arithmetic on the average monthly return: `(1 + mean monthly)^12 - 1`. Volatility scales the monthly sample standard deviation by `sqrt(12)`.

## Missing or messy price data

- At **load time**, prices must be positive numbers; numeric strings are coerced; a few **Excel day serials** in the source file are converted to ISO dates.
- When forming month-end series, if the prior month-end is missing or non-positive, that return interval is **skipped** (no interpolation, no forward-fill across silent gaps). Sparse history shortens the effective sample for volatility and scoring.

## Soft constraints (interpretation)

“Soft” is read as **targets enforced by iteration**, not as hard KKT feasibility:

- Per-asset floor and cap (`min_weight`, `max_weight` in the policy file, mapped to `minAssetWeight` / `maxAssetWeight`).
- Asset-class caps (`per_asset_class_caps`) become sector **ceilings** with floor 0 in the internal model (asset class from the holdings file is treated as the sector bucket).
- **Turnover**: the policy file does not specify turnover; the loader assumes a **default cap** (see `actualData.ts` / README) so the pipeline stays bounded—documented as an explicit assumption.
- **`max_assets`**: the file caps the number of names; simultaneously enforcing a positive minimum line size on every name would require **cardinality** (integer) optimisation. The app **records** this trade-off in constraint notes and methodology rather than silently merging positions—full enforcement is left as an explicit limitation and debrief topic.

## Known limitations

- Correlations enter only through the **realised** portfolio return series used for rough ex-post volatility, not a full covariance matrix.
- Duplicate ISINs in holdings share one price series; the loader duplicates points per portfolio line so each `assetId` has a return history.
- Mixed line currencies in the source holdings are **not** FX-converted; portfolio `currency` is taken as USD for presentation consistency—another explicit assumption.
