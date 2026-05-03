---
name: portfolio-recommendation
description: Build or modify the Antarctica portfolio recommendation workflow. Use when working on monthly return calculations, generated portfolio JSON data, soft constraints, recommendation rationale, or debrief-ready methodology.
---

# Portfolio Recommendation

## Instructions

1. Start from `data/holdings.json`, `prices.json`, `benchmark.json`, and `constraints.json`, mapped in `src/lib/portfolio/actualData.ts`.
2. Convert daily prices and benchmark levels to month-end series before calculating returns.
3. Score assets using risk-adjusted monthly performance, then tilt from current weights.
4. Apply soft constraints after scoring: asset bounds, sector bounds, turnover, and total weight.
5. Keep output deterministic and explainable. Each asset needs a plain-English rationale.
6. Validate changes with `npm test`; run `npm run lint` and `npm run build` before delivery.

## Debrief Notes

When explaining the approach, cover:

- how author-supplied JSON was normalised (ISIN, dates, weights);
- why monthly returns drive the recommendation;
- why a pragmatic scorer was chosen over an opaque optimiser;
- where constraints affected the final weights;
- what would be improved next with more time or real production data.
