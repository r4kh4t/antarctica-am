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

## Data

Portfolio inputs are JSON under `data/actual/`. `src/lib/portfolio/actualData.ts` normalises the author file shape (ISINs, dates, weights) into the app’s TypeScript types; `src/lib/portfolio/data.ts` validates and exposes `getPortfolioData()`. Root-level `data/*.json` files are legacy fixtures and are not used by the current load path.
