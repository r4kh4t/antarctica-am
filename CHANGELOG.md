# Changelog

All notable changes to this project are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).  
Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/).

Versioning rule: bump `package.json` **and** add a changelog entry in the same commit.

---

## [0.9.0] — 2026-04-30

### Fixed
- `WeightChart.tsx`: use absolute `@/components/chart/WeightChartContent` import path for clarity
- `rationale.ts`: replace Unicode en-dash ranges with ASCII hyphens (Biome normalisation)

### Added
- `.github/dependabot.yml`: weekly Dependabot updates for npm and GitHub Actions. Minor/patch bumps grouped into single PRs; major bumps for `next`, `react`, `typescript`, `tailwindcss` are ignored (upgrade intentionally). PRs auto-assigned to `infrastructure` label and `v0.9.0` milestone.


- `.github/dependabot.yml`: weekly Dependabot updates for npm and GitHub Actions. Minor/patch bumps grouped into single PRs; major bumps for `next`, `react`, `typescript`, `tailwindcss` ignored (upgrade manually). All Dependabot PRs assigned to milestone `v0.9.0` with label `infrastructure`.
- `.github/ISSUE_TEMPLATE/feature.md`, `.github/ISSUE_TEMPLATE/bug.md`: structured issue templates with acceptance criteria.
- `.github/pull_request_template.md`: PR checklist requiring issue linkage, CHANGELOG, version bump, and CI.
- `scripts/create-project-board.sh`: one-shot script to create GitHub Projects v2 board and add all 13 issues (run after granting `project` scope).
- `.cursor/rules/github-workflow.mdc`: AI rule documenting issue/PR/board workflow and commit linkage convention.
- 13 GitHub Issues created (#1–#13), labelled, assigned to milestone `v0.8.0`, and closed as completed.
- 5 labels created: `feature`, `bug`, `refactor`, `infrastructure`, `documentation`.
- 2 milestones: `v0.8.0 — Initial Delivery` (closed), `v0.9.0 — Refinement` (open).

### Changed
- `.husky/commit-msg`: show advisory tip when `feat`/`fix`/`refactor` commits omit a `#N` issue reference.

---

## [0.8.0] — 2026-04-30

### Added
- `src/lib/constants.ts`: centralise `AI_STATUS` const object, `AiState` discriminated union (moved from `PortfolioDashboard`), and `API_ROUTES`. Eliminates magic strings across 3 components.
- `.cursor/rules/changelog.mdc`: AI rule enforcing changelog + `package.json` version update on every meaningful commit.
- `.cursor/hooks/post-edit-reminder.mjs`: extended to remind about `CHANGELOG.md` after any `src/` file edit.
- `.cursor/subagents/changelog-updater.md`: autonomous subagent for retroactive changelog updates and version promotion.

### Changed
- `WeightChart`: removed `next/dynamic` wrapper — both `WeightChart` and `WeightChartContent` are `"use client"`, making `ssr: false` a no-op. Regular import eliminates the module-resolution false positive and the `IntrinsicAttributes` mismatch.
- `WeightChartContent`: removed default export added as a `dynamic()` workaround; back to a single named export.

### Fixed
- `guardrails.test.ts`: cast `sectorInsights: undefined` test fixture to bypass Zod's `.default({})` inferred non-optional type.
- `schemas.test.ts`: replace `typeof x satisfies "literal"` (always errors — `typeof` value has union type) with `void (x satisfies Type)` for compile-time check + separate `expect(typeof x).toBe(...)` for runtime check.
- `.cursor/rules/tailwind.mdc`: add "no arbitrary rem/em" rule; document built-in scale equivalents and `@theme` token pattern.
- `globals.css @theme`: add `--tracking-label-sm`, `--tracking-label`, `--tracking-label-lg` tokens; replace all `tracking-[Xem]` arbitrary values across 5 components.

---

## [0.7.0] — 2026-04-30

### Added
- `.cursor/rules/tailwind.mdc`: Tailwind v4 CSS variable shorthand rule; documents `@theme` usage and token reference table.
- `globals.css @theme`: named letter-spacing tokens (`--tracking-label-sm`, `--tracking-label`, `--tracking-label-lg`).

### Changed
- `globals.css`: migrate brand colour tokens from `:root` (`--antarctica-*`) to Tailwind v4 `@theme` semantic names (`--color-ink`, `--color-primary`, `--color-primary-subtle`, `--color-primary-muted`, `--color-secondary`, `--color-surface`, `--color-border`). All 8 component files updated to plain utility classes (`bg-ink`, `text-primary`, `ring-border`, etc.).
- All components: migrate `[var(--*)]` arbitrary CSS variable syntax to Tailwind v4 `(--*)` shorthand.
- `PortfolioDashboard`: `rounded-[2rem]` → `rounded-4xl`.
- `biome.json`: enable `css.parser.tailwindDirectives` so Biome accepts `@theme` blocks.

---

## [0.6.0] — 2026-04-30

### Added
- **Rollbar error tracking** (`rollbar`, `@rollbar/react`) — client via `<RollbarProvider>`, root-layout via `global-error.tsx`, server via `captureServerError()` in API route. No-op when tokens absent.
- **Vercel Web Analytics** (`@vercel/analytics`) — 50 k events/month free.
- **Vercel Speed Insights** (`@vercel/speed-insights`) — Core Web Vitals, 10 k data points/month free.
- **GitHub Actions CI** (`.github/workflows/ci.yml`) — format → lint → test → build; changelog presence check on PRs to `main`/`develop`.
- **Commit message hook** (`.husky/commit-msg`) — enforces Conventional Commits format.
- **Branch naming hook** (`.husky/pre-push`) — enforces `<type>/<description>` branch names.
- **Cursor subagents** — `ci-runner`, `dependency-updater`, `pre-release-checker`, `test-writer`.
- **Cursor skills** — `deploy`, `testing`, `debug`, `langfuse`.
- `CHANGELOG.md` introduced; changelog enforcement in CI.

### Changed
- **Langfuse tracing** — replaced manual `traceLLMCall()` with `observeOpenAI` (`@langfuse/openai` + `@langfuse/otel` + `@opentelemetry/sdk-trace-node`).
- `src/instrumentation.ts` — Next.js startup hook registering `NodeTracerProvider` + `LangfuseSpanProcessor`.
- `src/lib/llm/observability.ts` — `getTracedOpenAIClient()` singleton using `observeOpenAI`.
- `src/lib/llm/instructor.ts` — wraps the traced client; all completions automatically traced.
- `next.config.ts` — `serverExternalPackages` for OTel + Rollbar.
- All three `docs/` files updated to reflect current stack.

### Removed
- `src/lib/llm/langfuse.ts` — replaced by `observability.ts` + OpenTelemetry.

---

## [0.5.0] — 2026-04-29

### Added
- **Biome formatter** replacing Prettier — `npm run format`, `npm run format:check`, `lint-staged` updated.
- **Instructor JS + Zod** (`@instructor-ai/instructor`, `zod`) — `RationaleResponseSchema`, auto-retry, structured outputs.
- **38 unit tests** — `tokens.test.ts`, `guardrails.test.ts`, `formatters.test.ts`, `schemas.test.ts`.

### Removed
- `.prettierrc`, `.prettierignore`.

---

## [0.4.0] — 2026-04-28

### Added
- **AI rationale generation** — `POST /api/rationale` calls GPT-4o; portfolio data formatted as markdown tables.
- **Pill-based filters** and **column sorting** in `RecommendationTable`.
- **Component grouping** — `dashboard/`, `table/`, `chart/`, `shared/` subdirectories.
- **LLM utilities** — `client.ts`, `tokens.ts`, `guardrails.ts`, `formatters.ts`, `prompts/rationale.ts`.
- Cursor rule `llm-integration.mdc`. `docs/llm-integration.md`.

### Fixed
- `assetId` key mapping, sector insight tooltips, algo-rationale icon + tooltip, bold backtick rendering via `InlineMarkdown`.

---

## [0.3.0] — 2026-04-27

### Added
- Antarctica brand: Gotham font stack, brand colour palette, SVG favicon.
- Responsive `RecommendationTable` with horizontal scroll.
- Pre-commit hooks (Husky + lint-staged).
- `docs/` folder with architecture, methodology, workflow, brand notes.

---

## [0.2.0] — 2026-04-26

### Added
- Vercel deployment. GitHub private repository. `AGENTS.md`.

---

## [0.1.0] — 2026-04-26

### Added
- Next.js scaffold, fixture data, portfolio calculation pipeline, dashboard UI, 5 unit tests, Cursor rules/hooks/skills.
