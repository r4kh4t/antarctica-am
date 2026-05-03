# Architecture

## Overview

A focused Next.js 16 dashboard that reads portfolio data, calculates risk-adjusted asset weights, generates AI-powered rationale via GPT, and presents the result in a stakeholder-ready UI. The calculation layer is kept separate from React components so it can be tested independently and discussed in a debrief.

## Data Flow

```
data/actual/*.json
  └─ src/lib/portfolio/actualData.ts    normalise author schema → internal types
       └─ src/lib/portfolio/data.ts     validate weights + uniqueness
       └─ src/lib/portfolio/monthlyReturns.ts   daily prices → month-end returns
            └─ src/lib/portfolio/recommendation.ts  score assets, apply constraints
                 └─ src/app/page.tsx    server-render → serializable props
                      └─ src/components/dashboard/PortfolioDashboard.tsx  (client)
                           ├─ POST /api/rationale  → GPT-4o → AI commentary
                           ├─ src/components/table/RecommendationTable.tsx
                           ├─ src/components/chart/WeightChart.tsx
                           └─ src/components/dashboard/MethodologyCard.tsx
```

## Component Groups (`src/components/`)

| Directory | Contents |
|---|---|
| `dashboard/` | `PortfolioDashboard` (central AI state), `MethodologyCard` |
| `table/` | `RecommendationTable`, `TableControls` (filters + sort) |
| `chart/` | `WeightChart` (server shell), `WeightChartContent` (client, no-SSR) |
| `shared/` | `Skeleton`, `Tooltip`, `InlineMarkdown` |
| `providers.tsx` | Client-only provider tree (`RollbarProvider`) |

## LLM Utilities (`src/lib/llm/`)

| File | Purpose |
|---|---|
| `client.ts` | Base OpenAI singleton; model name & reasoning-model detection |
| `observability.ts` | `observeOpenAI`-traced client (Langfuse); falls back to plain client if no credentials |
| `instructor.ts` | Instructor-wrapped client for structured output + auto-retry |
| `schemas.ts` | Zod schema for LLM response validation |
| `guardrails.ts` | Input validation (`validateRationaleRequest`) + output normalisation |
| `formatters.ts` | Portfolio data → markdown tables (LLM input) |
| `tokens.ts` | Token estimation, context window guard (`assertFitsContext`) |
| `prompts/rationale.ts` | Versioned system prompt (`PROMPT_VERSION`) |

## API Route

`POST /api/rationale` — receives portfolio metrics, calls GPT, returns per-asset rationale + narrative.

- Standard models (GPT-4o): Instructor + Zod → structured, validated, auto-retried output
- Reasoning models (o-series): direct OpenAI call + manual `RationaleResponseSchema.parse()`
- After response: `langfuseSpanProcessor.forceFlush()` ensures traces reach Langfuse in serverless
- On error: `captureServerError()` sends the exception to Rollbar (if configured)

## Observability Stack

| Layer | Tool | What it captures |
|---|---|---|
| LLM tracing | Langfuse (`@langfuse/openai`) | Prompt, response, tokens, cost, latency |
| Browser errors | Rollbar (`@rollbar/react`) | Uncaught exceptions, promise rejections |
| Root crashes | Rollbar (`global-error.tsx`) | Root layout / template failures |
| Server errors | Rollbar (`captureServerError`) | API route exceptions |
| Page views | Vercel Web Analytics | Visitors, page views, referrers |
| Performance | Vercel Speed Insights | Core Web Vitals (LCP, CLS, FID) |

## OpenTelemetry Setup

`src/instrumentation.ts` is a Next.js startup hook that registers a `NodeTracerProvider` with `LangfuseSpanProcessor`. This runs once at server start and is safe in both local and serverless (Vercel) environments.

## Design Choices

- **Static page** — all data is local and deterministic; no database or auth needed.
- **Server-side calculation** — portfolio math stays in plain TypeScript functions, not React hooks; keeps it testable and out of the browser bundle.
- **No-SSR chart** — Recharts needs browser layout measurement; `WeightChartContent` is dynamically imported with `ssr: false`.
- **Explainable method** — risk-adjusted scoring with transparent constraint handling beats a black-box optimiser for a stakeholder debrief.
- **Graceful degradation** — missing API keys (OpenAI, Langfuse, Rollbar) all degrade gracefully; the dashboard is always functional.
