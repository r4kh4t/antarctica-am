# LLM Integration

This document covers the AI rationale generation feature added to the portfolio recommendation dashboard.

## Overview

On page load, the `PortfolioDashboard` component calls `POST /api/rationale` with the portfolio metrics. The API route formats the data as markdown tables, sends it to an OpenAI model, and returns per-asset professional commentary plus an overall portfolio narrative. While the call is in flight, skeleton loading placeholders are shown in the rationale column.

## Architecture

```
Client (PortfolioDashboard)
  └─ POST /api/rationale (Next.js Route Handler)
       ├─ validateRationaleRequest()   guardrails: input
       ├─ formatForLLM()               convert data → markdown tables
       ├─ assertFitsContext()          token budget check
       ├─ observeOpenAI client         Langfuse-traced OpenAI call
       ├─ Instructor (Zod schema)      structured output + auto-retry
       └─ normalizeRationaleResponse() guardrails: output
```

## LLM Utilities (`src/lib/llm/`)

| File                   | Purpose                                                            |
| ---------------------- | ------------------------------------------------------------------ |
| `client.ts`            | Base OpenAI client; model name & reasoning-model detection         |
| `observability.ts`     | `observeOpenAI` traced client singleton (replaces manual tracing)  |
| `tokens.ts`            | Token estimation, model context limits, budget guard               |
| `guardrails.ts`        | Input/output type definitions and validation                       |
| `formatters.ts`        | Convert `PortfolioRecommendation` → markdown tables                |
| `prompts/rationale.ts` | Versioned system prompt (`PROMPT_VERSION`)                         |
| `schemas.ts`           | Zod schema for LLM response validation                             |
| `instructor.ts`        | Instructor-wrapped client for structured output with auto-retry    |

## Environment Variables

| Variable              | Required | Default          | Notes                              |
| --------------------- | -------- | ---------------- | ---------------------------------- |
| `OPENAI_API_KEY`      | Yes      | —                | Rotate immediately if leaked       |
| `OPENAI_MODEL`        | No       | `gpt-4o`         | Set `o4-mini` for reasoning model  |
| `LANGFUSE_SECRET_KEY` | No       | —                | Leave blank to disable tracing     |
| `LANGFUSE_PUBLIC_KEY` | No       | —                | Required when secret key is set    |
| `LANGFUSE_HOST`       | No       | Langfuse EU cloud| Use `us.cloud.langfuse.com` for US |

## Observability with Langfuse

Tracing uses the official `@langfuse/openai` framework integration (drop-in wrapper around the OpenAI SDK), backed by OpenTelemetry.

### How it works

1. **`src/instrumentation.ts`** — Next.js instrumentation hook, runs once at startup. Registers a `NodeTracerProvider` with `LangfuseSpanProcessor` so all OTel spans are exported to Langfuse.

2. **`src/lib/llm/observability.ts`** — `getTracedOpenAIClient()` returns a singleton OpenAI client wrapped with `observeOpenAI`. This automatically traces:
   - Prompt and completion content
   - Token usage and estimated cost (USD)
   - Latency and time-to-first-token
   - OpenAI API errors

3. **`src/app/api/rationale/route.ts`** — Uses the traced client for all OpenAI calls. After the response is sent, `after(() => langfuseSpanProcessor.forceFlush())` flushes pending spans before the serverless function terminates.

### Why framework integration over manual tracing

The previous approach used a hand-rolled `Langfuse` client with manual `trace()` / `generation()` / `flushAsync()` calls. The `observeOpenAI` integration captures everything automatically with less code, better reliability, and richer metadata (e.g. time-to-first-token on streams). The skill from [github.com/langfuse/skills](https://github.com/langfuse/skills) explicitly recommends framework integrations over manual instrumentation.

### Enabling Langfuse

1. Create a free account at [cloud.langfuse.com](https://cloud.langfuse.com)
2. Create a project and copy your API keys from **Settings → API Keys**
3. Set the three env vars in `.env.local`:
   ```
   LANGFUSE_SECRET_KEY=sk-lf-...
   LANGFUSE_PUBLIC_KEY=pk-lf-...
   LANGFUSE_HOST=https://cloud.langfuse.com
   ```
4. Restart the dev server — traces will appear in the Langfuse **Traces** view

No data is sent to Langfuse unless both key env vars are explicitly set.

### What you can see in Langfuse

- **Traces view** — individual `/api/rationale` requests with prompt/response
- **Generations** — token counts, cost in USD, latency per call
- **Model analytics** — compare prompt versions over time (tagged with `PROMPT_VERSION`)
- **Tags** — `portfolio-rationale`, `antarctica-am` for quick filtering

## Prompt Versioning

The system prompt is stored in `src/lib/llm/prompts/rationale.ts` with a semantic version constant `PROMPT_VERSION`. Increment this constant whenever the prompt changes materially. The version is:
- Included in every Langfuse generation for comparison
- Returned in API responses for client-side display
- Used as the `version` tag on `observeOpenAI` calls

## Data Formatting for LLM

Portfolio data is converted to three markdown tables before being sent to the model:

1. **Proposed Rebalancing** — asset ID, sector, region, current %, recommended %, change %
2. **Asset Performance Metrics** — asset ID, avg monthly return, annualised volatility, risk-adjusted score, vs benchmark
3. **Sector Exposures** — sector, current weight, recommended weight

Markdown tables significantly outperform raw JSON for numerical reasoning tasks because the LLM can compare rows horizontally and process the structure like prose.

## Structured Output with Instructor + Zod

All standard-model responses are validated through `RationaleResponseSchema` (Zod) via Instructor JS:
- Automatic retry (up to 2 times) with corrective feedback if the schema fails
- Minimum string length constraints on narrative and per-asset rationale
- Optional `sectorInsights` field with graceful default

## Guardrails

**Input:**

- `rows` must be a non-empty array with valid `assetId` strings
- Weights must be in [0, 1]
- Recommended weights must sum to approximately 1.0 (±1%)

**Output:**

- Response must be valid JSON with `narrative` (string ≥ 20 chars) and `rationale` object
- Missing assets are filled with an empty string rather than rejecting the entire response
- JSON parse errors surface as 500 with a log entry; the UI falls back to algorithmic rationale

## Token Budget

- A simple 4-chars-per-token approximation is used (avoids WASM tiktoken dependency)
- `assertFitsContext()` throws if the estimated prompt exceeds 85% of the model's context window
- For 8 assets, the full prompt is roughly 800–1 200 tokens — well within any GPT-4 class model

## Reasoning Models

Set `OPENAI_MODEL=o4-mini` to use OpenAI's thinking model. The code detects o-series models via `isReasoningModel()` and bypasses Instructor (which requires JSON mode), falling back to direct OpenAI calls with manual Zod parsing.

## Graceful Degradation

If the OpenAI API key is missing, times out, or returns an error, the dashboard silently falls back to the deterministic algorithmic rationale computed at build time. The "AI-enhanced" badge is not shown in this case.
