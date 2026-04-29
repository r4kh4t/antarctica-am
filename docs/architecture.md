# Architecture

## Overview

The app is a focused Next.js dashboard for producing and explaining a portfolio weight recommendation. It keeps the calculation layer separate from React components so the business logic can be tested independently and discussed in a debrief.

## Data Flow

1. JSON fixtures live in `data/`.
2. `src/lib/portfolio/data.ts` loads and validates the basic portfolio shape.
3. `src/lib/portfolio/monthlyReturns.ts` converts daily prices into month-end monthly returns.
4. `src/lib/portfolio/recommendation.ts` builds asset metrics, applies scoring, enforces soft constraints, and returns a dashboard-ready result.
5. `src/app/page.tsx` server-renders the recommendation and passes serializable props to UI components.
6. `src/components/WeightChartContent.tsx` is dynamically loaded on the client because Recharts needs browser layout measurement.

## Design Choices

- The page is static because all data is local and deterministic.
- Portfolio math is kept in plain TypeScript functions, not React hooks.
- The chart is isolated behind a no-SSR wrapper to keep production builds clean.
- The recommendation method favors explainability over a black-box optimizer.
