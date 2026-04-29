# LLM Integration

This document covers the AI rationale generation feature added to the portfolio recommendation dashboard.

## Overview

On page load, the `RecommendationTable` component calls `POST /api/rationale` with the portfolio metrics. The API route formats the data as markdown tables, sends it to an OpenAI model, and returns per-asset professional commentary plus an overall portfolio narrative. While the call is in flight, skeleton loading placeholders are shown in the rationale column.

## Architecture

```
Client (RecommendationTable)
  └─ POST /api/rationale (Next.js Route Handler)
       ├─ validateRationaleRequest()   guardrails: input
       ├─ formatForLLM()               convert data → markdown tables
       ├─ assertFitsContext()          token budget check
       ├─ openai.chat.completions      call OpenAI
       ├─ traceLLMCall()               optional Langfuse trace
       └─ validateRationaleResponse()  guardrails: output
```

## LLM Utilities (`src/lib/llm/`)

| File                   | Purpose                                                         |
| ---------------------- | --------------------------------------------------------------- |
| `client.ts`            | Singleton OpenAI client; model name & reasoning-model detection |
| `tokens.ts`            | Token estimation, model context limits, budget guard            |
| `guardrails.ts`        | Input/output type definitions and validation                    |
| `formatters.ts`        | Convert `PortfolioRecommendation` → markdown tables             |
| `prompts/rationale.ts` | Versioned system prompt (`PROMPT_VERSION`)                      |
| `langfuse.ts`          | Optional observability wrapper                                  |

## Environment Variables

| Variable              | Required | Default        | Notes                             |
| --------------------- | -------- | -------------- | --------------------------------- |
| `OPENAI_API_KEY`      | Yes      | —              | Rotate immediately if leaked      |
| `OPENAI_MODEL`        | No       | `gpt-4o`       | Set `o4-mini` for reasoning model |
| `LANGFUSE_SECRET_KEY` | No       | —              | Leave blank to disable tracing    |
| `LANGFUSE_PUBLIC_KEY` | No       | —              | Required when secret key is set   |
| `LANGFUSE_HOST`       | No       | Langfuse cloud | Self-hosted endpoint              |

## Prompt Versioning

The system prompt is stored in `src/lib/llm/prompts/rationale.ts` with a semantic version constant `PROMPT_VERSION`. Increment this constant whenever the prompt changes materially and add a changelog entry. The version is included in API responses and Langfuse traces for auditability.

## Data Formatting for LLM

Portfolio data is converted to three markdown tables before being sent to the model:

1. **Proposed Rebalancing** — asset, sector, region, current %, recommended %, change %
2. **Asset Performance Metrics** — avg monthly return, annualised volatility, risk-adjusted score, vs benchmark
3. **Portfolio Context** — expected return, volatility, turnover, benchmark

Markdown tables significantly outperform raw JSON for numerical reasoning tasks because the LLM can compare rows horizontally and process the structure like prose.

## Guardrails

**Input:**

- `rows` must be a non-empty array with valid `assetId` strings
- Weights must be in [0, 1]
- Recommended weights must sum to approximately 1.0 (±1%)

**Output:**

- Response must be valid JSON with `narrative` (string ≥ 10 chars) and `rationale` object
- Missing assets are filled with a fallback string rather than rejecting the entire response
- JSON parse errors surface as 500 with a log entry; the UI falls back to algorithmic rationale

## Token Budget

- A simple 4-chars-per-token approximation is used (avoids WASM tiktoken dependency)
- `assertFitsContext()` throws if the estimated prompt exceeds 85% of the model's context window
- For 8 assets, the full prompt is roughly 800–1 200 tokens — well within any GPT-4 class model

## Reasoning Models

Set `OPENAI_MODEL=o4-mini` to use OpenAI's thinking model. The code detects o-series models via `isReasoningModel()` and omits `temperature` and `response_format: json_object` parameters accordingly. The system prompt already instructs the model to return plain JSON to handle this case.

## Observability with Langfuse

[Langfuse](https://langfuse.com) is an optional LLM observability platform. When `LANGFUSE_SECRET_KEY` is set, each rationale call is traced with model name, prompt version, input messages, output, and token usage. This enables:

- Cost tracking per request
- Prompt version comparison
- Latency monitoring
- Output quality review

No data is sent to Langfuse unless the environment variable is explicitly set.

## Graceful Degradation

If the OpenAI API key is missing, times out, or returns an error, the `RecommendationTable` silently falls back to the deterministic algorithmic rationale computed at build time. The "AI-enhanced" badge is not shown in this case. This ensures the dashboard is always functional even without a valid API key.
