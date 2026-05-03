# Agent Guidance

This repository is a take-home assignment for a senior Next.js role at an asset management company.

## Priorities

- Ship simple, reviewable changes that match the brief; avoid speculative architecture and unnecessary abstractions.
- Follow Next.js App Router conventions: keep data loading and portfolio logic off the client where it belongs.
- Keep portfolio outputs **deterministic**; cover calculation code with focused unit tests.
- When the brief leaves financial details open, document assumptions in `README.md` or `docs/` in plain language.
- Treat LLM output as **draft** content: validate, test, and correct before treating it as final.

## Commands

- `npm run dev` — local dev server
- `npm test` — portfolio and unit tests
- `npm run lint` — ESLint
- `npm run build` — production build (run before shipping)

## Optimisation rationale

The brief asks to optimise on monthly returns but leaves every other decision open. Rather than a full mean-variance (Markowitz) solve — which requires a stable covariance matrix, is sensitive to estimation error on a thin monthly sample, and is opaque to non-quant stakeholders — this implementation scores each asset using a **Sharpe-like ratio**: annualised arithmetic mean of monthly returns divided by annualised monthly volatility. Proposed weights are formed by **tilting from the current book** toward higher-scoring names (bounded z-score tilt, not a full rebuild from zero), then projected onto soft constraints via iterative rescaling. The first return interval uses the **partial first calendar month** from the **first data point** to that month’s month-end close when applicable; thereafter monthly returns are **arithmetic** (`P_t / P_{t-1} − 1`) between successive month-end closes. No forward-fill is applied across missing dates. Cumulative performance on the dashboard compounds from day one per `README.md` / `docs/recommendation-methodology.md`. Soft constraints are enforced by iterative projection and normalisation rather than a constrained quadratic programme, so violations shrink but are not guaranteed to be exactly zero. The result is deterministic, fully traceable in a dozen lines of TypeScript, and every allocation decision can be explained in plain English — the right trade-off for a small stakeholder-facing fund and a take-home where the debrief matters as much as the output.

## Data

Portfolio inputs are JSON under `data/` (`holdings.json`, `prices.json`, `benchmark.json`, `constraints.json`). `src/lib/portfolio/actualData.ts` normalises the author file shape (ISINs including **duplicate row merge**, mixed date formats, string prices, currency aliases) into the app’s TypeScript types; `src/lib/portfolio/data.ts` validates and exposes `getPortfolioData()`.
