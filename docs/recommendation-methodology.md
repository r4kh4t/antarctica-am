# Recommendation Methodology

## Objective (engineering choice)

The brief asks for optimisation on **monthly returns** but does not fix an objective. This implementation uses a **Sharpe-like ranking**: annualised sample mean of monthly returns divided by annualised sample volatility of those same monthly returns. Proposed weights tilt **from the current book** toward higher-ranked names, then **soft constraints** reshape the vector.

Why not full Markowitz mean–variance here: the brief rewards transparency and testability; a covariance-based QP would need stronger assumptions on a thin monthly sample and is harder to defend line-by-line in a debrief.

## Monthly returns (definition)

1. Build a **month-end price** for each calendar month using the **last available daily close** in that month (per asset and for the benchmark level series).
2. **First partial month.** If the **first observation** in the series is *earlier than* that month’s month-end observation, prepend one return for that calendar month:
   \(r_{\text{first}} = \frac{P_{\text{month-end, first month}}}{P_{\text{first obs}}} - 1\).
   Subsequent months remain standard month-over-month links: arithmetic `r = P(end)/P(prev) − 1` between consecutive month-end values.
3. Cumulative charts compound these monthly arithmetic returns starting from index 100 on day one. For any month **M**, the compounded index satisfies  
   \(\prod_{m \le M}(1 + r_m) = \frac{\text{level at M’s month-end}}{\text{level at first data point}}\)  
   (benchmark verified in unit tests to floating-point precision).
4. Annualised return in scoring uses compound arithmetic on the **average** monthly return: `(1 + mean monthly)^12 - 1`. Volatility scales the monthly **sample** standard deviation by `sqrt(12)`.

## Missing or messy price data

- At **load time**, prices must be positive numbers; numeric strings are coerced; a few **Excel day serials** in the source file are converted to ISO dates.
- When forming month-end series, if the prior month-end is missing or non-positive, that return interval is **skipped** (no interpolation, no forward-fill across silent gaps). Sparse history shortens the effective sample for volatility and scoring.

## Soft constraints (interpretation)

“Soft” is read as **targets enforced by iteration**, not as hard KKT feasibility:

- Per-asset floor and cap (`min_weight`, `max_weight` in the policy file, mapped to `minAssetWeight` / `maxAssetWeight`).
- Asset-class caps (`per_asset_class_caps`) become sector **ceilings** with floor 0 in the internal model (asset class from the holdings file is treated as the sector bucket).
- **Turnover**: the policy file does not specify turnover; the loader assumes a **default cap** (see `actualData.ts` / README) so the pipeline stays bounded—documented as an explicit assumption.
- **`max_assets`**: the file caps the number of names. The optimiser uses **weight tilting** from the current book with iterative projection; it does **not** run a mixed-integer programme to zero out names. When the implied number of active lines exceeds the cap, the Data Quality / constraint panel reports a **soft violation** and documents the trade-off. Full cardinality enforcement is an explicit limitation and a documented roadmap item.

## Known limitations

- Correlations enter only through the **realised** portfolio return series used for rough ex-post volatility, not a full covariance matrix.
- **Duplicate ISINs** in raw holdings are **merged at load** (weights summed, first-seen name kept) so the economic position is one line per ISIN; price history is not double-counted in the optimiser.
- Mixed line currencies in the source holdings are **not** FX-converted; portfolio `currency` is taken as USD for presentation consistency—another explicit assumption.
- The ranking uses **mean / volatility** on monthly returns without subtracting a **risk-free rate**; call it a Sharpe-like heuristic, not a textbook Sharpe ratio.
