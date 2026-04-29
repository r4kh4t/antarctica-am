# Changelog

All notable changes to this project are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).  
Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/).

---

## [Unreleased]

### Added
- **Rollbar error tracking** (`rollbar`, `@rollbar/react`) — client-side via `<RollbarProvider>`, root-layout via `global-error.tsx`, server-side via `captureServerError()` in the API route. No-op when tokens are absent.
- **Vercel Web Analytics** (`@vercel/analytics`) — privacy-first page views and visitor stats, 50 k events/month free.
- **Vercel Speed Insights** (`@vercel/speed-insights`) — Core Web Vitals per real visitor, 10 k data points/month free.
- **GitHub Actions CI** (`.github/workflows/ci.yml`) — format check → lint → test → build on every push/PR to `main`, `develop`, `staging`. Fails on PRs that skip `CHANGELOG.md`.
- **Commit message hook** (`.husky/commit-msg`) — enforces Conventional Commits format on every commit.
- **Branch naming hook** (`.husky/pre-push`) — enforces `<type>/<description>` branch names before every push.
- **Cursor subagents** (`.cursor/subagents/`) — `ci-runner`, `dependency-updater`, `pre-release-checker`, `test-writer` autonomous agents.
- **Cursor skills** — `deploy`, `testing`, `debug`, `langfuse` reference guides.
- `CHANGELOG.md` — this file; changelog enforcement added to CI.

### Changed
- **Langfuse tracing replaced** — removed manual `traceLLMCall()` / `Langfuse` client; replaced with `observeOpenAI` framework integration (`@langfuse/openai` + `@langfuse/otel` + `@opentelemetry/sdk-trace-node`). Automatic token, cost, latency, and error tracking. Serverless-safe `forceFlush()` via Next.js `after()`.
- `src/instrumentation.ts` — new Next.js startup hook registering `NodeTracerProvider` + `LangfuseSpanProcessor`.
- `src/lib/llm/observability.ts` — replaces `langfuse.ts`; exports `getTracedOpenAIClient()` singleton.
- `src/lib/llm/instructor.ts` — now wraps the Langfuse-traced client so all Instructor completions are automatically traced.
- `next.config.ts` — added `serverExternalPackages` to prevent Turbopack bundling OTel + Rollbar for the browser.
- `docs/development-workflow.md` — updated: Biome replaces Prettier reference, new commit/branch conventions, changelog policy, CI steps.
- `docs/ai-workflow.md` — updated: new skills, subagents, LLM feature list.
- `docs/architecture.md` — updated: component groups, LLM utilities table, full observability stack, OTel setup.

### Removed
- `src/lib/llm/langfuse.ts` — replaced by `observability.ts` + OpenTelemetry integration.

---

## [0.5.0] — 2026-04-29

### Added
- **Biome formatter** (`@biomejs/biome`) replacing Prettier. `npm run format` and `npm run format:check` updated. `lint-staged` updated to use `biome format --write`.
- **Instructor JS + Zod structured outputs** (`@instructor-ai/instructor`, `zod`) — `schemas.ts` defines `RationaleResponseSchema`; API route uses Instructor for GPT-4o with `max_retries: 2`; o-series falls back to direct call + manual `RationaleResponseSchema.parse()`.
- **38 unit tests** across 4 new test files: `tokens.test.ts`, `guardrails.test.ts`, `formatters.test.ts`, `schemas.test.ts`.

### Removed
- `.prettierrc`, `.prettierignore` — replaced by Biome.

---

## [0.4.0] — 2026-04-28

### Added
- **AI rationale generation** — `POST /api/rationale` calls GPT-4o with portfolio data formatted as markdown tables. Loading skeleton in rationale column.
- **Pill-based filters** and **column sorting** in `RecommendationTable`.
- **Component grouping** — components reorganised into `dashboard/`, `table/`, `chart/`, `shared/` subdirectories.
- **Langfuse observability** (initial manual implementation via `langfuse.ts`).
- **LLM utilities** — `client.ts`, `tokens.ts`, `guardrails.ts`, `formatters.ts`, `prompts/rationale.ts`.
- **Cursor rule** `llm-integration.mdc` — prompt versioning, guardrails, token management, reasoning-model handling.
- `docs/llm-integration.md` — LLM integration documentation.

### Fixed
- `assetId` key mapping — `formatters.ts` now includes `Asset ID` column; prompt updated to use exact asset ID as JSON key.
- Sector insight tooltips added to `MethodologyCard`.
- Algorithmic-rationale fallback shows info icon + tooltip instead of generic text.
- Backtick-wrapped text in rationale rendered as bold via `InlineMarkdown` component.

---

## [0.3.0] — 2026-04-27

### Added
- Antarctica brand: Gotham font stack, brand colour palette via CSS variables, SVG favicon.
- Responsive `RecommendationTable` with horizontal scroll on small screens.
- `cursor-pointer` on sortable column headers.
- Pre-commit hooks (Husky + lint-staged) running format, lint, and tests.
- `docs/` folder: `architecture.md`, `recommendation-methodology.md`, `development-workflow.md`, `ai-workflow.md`, `brand-notes.md`.

---

## [0.2.0] — 2026-04-26

### Added
- Vercel deployment under `own-x-startup` scope.
- GitHub private repository with HTTPS remote.
- `AGENTS.md` — repository-level AI guidance.

---

## [0.1.0] — 2026-04-26

### Added
- Next.js 16 project scaffold (App Router, TypeScript, Tailwind CSS).
- Generated fixture data: `data/holdings.json`, `data/prices.json`, `data/benchmark.json`, `data/constraints.json`.
- Portfolio calculation pipeline: daily prices → month-end returns → risk-adjusted scoring → soft constraint enforcement.
- Dashboard UI: KPI cards, `RecommendationTable`, `WeightChart`, `MethodologyCard`.
- 5 portfolio unit tests (`recommendation.test.ts`).
- Cursor rules, hooks, and skills for AI-assisted development.
