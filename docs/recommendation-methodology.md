# Recommendation Methodology

## Objective

The brief says the portfolio should be optimised on monthly returns, but it does not specify a precise objective function. This implementation uses a pragmatic risk-adjusted scoring method that is easy to inspect and explain.

## Method

1. Convert each asset's daily price series into month-end prices.
2. Calculate monthly returns from adjacent month-end prices.
3. Estimate each asset's average monthly return and annualised volatility.
4. Score each asset using annualised return divided by annualised volatility.
5. Tilt the current portfolio toward stronger scores rather than rebuilding the portfolio from scratch.
6. Apply soft constraints for min/max asset weights, sector exposure ranges, turnover, and total weight.
7. Generate a rationale for each asset so the recommendation can be reviewed by a colleague.

## Why This Approach

The goal is not to produce a perfect institutional optimizer from fictional data. The goal is to show sound engineering judgment, a clear data flow, tested calculations, and a recommendation that a stakeholder can reason about.

## Known Limitations

- The fixture dataset is generated because the public JSON URLs were not included in the local brief.
- Volatility is based on the available monthly return history only.
- The constraint handling is intentionally simple and transparent.
- Correlations are only approximated through the realised weighted monthly return series, not through a full covariance optimizer.
