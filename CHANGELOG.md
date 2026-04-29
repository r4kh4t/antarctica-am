# Changelog

All notable changes to this project are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).  
Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/).

Versioning rule: bump `package.json` **and** add a changelog entry in the same commit.

---

## [1.2.3](https://github.com/r4kh4t/antarctica-am-draft/compare/antarctica-portfolio-recommendation-v1.2.2...antarctica-portfolio-recommendation-v1.2.3) (2026-04-29)


### CI / Tooling

* move release-branch-name into package config (must be package-level) ([0813dfd](https://github.com/r4kh4t/antarctica-am-draft/commit/0813dfd928818fa3b717e2b3d04f5953cb64bc88))

## [1.2.2](https://github.com/r4kh4t/antarctica-am-draft/compare/antarctica-portfolio-recommendation-v1.2.1...antarctica-portfolio-recommendation-v1.2.2) (2026-04-29)


### CI / Tooling

* set release-please branch name to chore/release ([42a91fb](https://github.com/r4kh4t/antarctica-am-draft/commit/42a91fb18bf36cf5abbbd841d956799f2d1685d0))

## [1.2.1](https://github.com/r4kh4t/antarctica-am-draft/compare/antarctica-portfolio-recommendation-v1.2.0...antarctica-portfolio-recommendation-v1.2.1) (2026-04-29)


### Bug Fixes

* remove isFront prop from ReferenceLine in SectorChart ([df2021e](https://github.com/r4kh4t/antarctica-am-draft/commit/df2021e76984be7ce426e5c52fe59ed24588b789))
* **security:** force postcss &gt;=8.5.10 via npm overrides (Dependabot [#1](https://github.com/r4kh4t/antarctica-am-draft/issues/1)) ([ef37e9b](https://github.com/r4kh4t/antarctica-am-draft/commit/ef37e9b9ff0c8a72f71463247b255240eec1fa4e))

## [1.2.0](https://github.com/r4kh4t/antarctica-am-draft/compare/antarctica-portfolio-recommendation-v1.1.0...antarctica-portfolio-recommendation-v1.2.0) (2026-04-29)


### Features

* add Biome, Instructor+Zod structured outputs, and 38 unit tests ([3b85d0f](https://github.com/r4kh4t/antarctica-am-draft/commit/3b85d0fc3bd3ee3ba9e022b23d206461db061975))
* add GPT rationale generation, pill filters, skeleton loading, component grouping ([3aa8ef0](https://github.com/r4kh4t/antarctica-am-draft/commit/3aa8ef00e17a6ce7c4430b70cca4c6f7001a81e2))
* add recommendation table controls ([3f86ff4](https://github.com/r4kh4t/antarctica-am-draft/commit/3f86ff472bf8a508784007c26f48c55af3049a24))
* analytics charts — performance line, risk-return scatter, sector bar ([d06ec40](https://github.com/r4kh4t/antarctica-am-draft/commit/d06ec40e15dc63c9d04407eea857a466192a0bf6))
* **analytics:** add Vercel Web Analytics and Speed Insights ([35aa998](https://github.com/r4kh4t/antarctica-am-draft/commit/35aa998ab77cb33792a8585df65bddfc2070372d))
* build portfolio recommendation app ([74d7784](https://github.com/r4kh4t/antarctica-am-draft/commit/74d778497196a59089c04ba85e0c4ef89c5fa52b))
* CSV export, security headers, release-please ([#16](https://github.com/r4kh4t/antarctica-am-draft/issues/16) [#24](https://github.com/r4kh4t/antarctica-am-draft/issues/24) [#25](https://github.com/r4kh4t/antarctica-am-draft/issues/25)) ([926715e](https://github.com/r4kh4t/antarctica-am-draft/commit/926715e4850cfd63feb8e3633b746bd28715c240))
* disable Export CSV while AI is loading, add tooltip ([54d25ad](https://github.com/r4kh4t/antarctica-am-draft/commit/54d25adf55da8e74544bcc59b375d51a6ea6a386))
* **monitoring:** add Rollbar error tracking (client + server) ([ef66507](https://github.com/r4kh4t/antarctica-am-draft/commit/ef665073adf15357afd0f0ed695c62982f0492f3))
* **observability:** replace manual Langfuse tracing with observeOpenAI integration ([004a370](https://github.com/r4kh4t/antarctica-am-draft/commit/004a370efed8e83d8f3a15f282ce6c87ff47fb1a))
* render backtick spans as bold in rationale and narrative text ([0db451e](https://github.com/r4kh4t/antarctica-am-draft/commit/0db451ee18b13ddb1e8d35d50ffef75a79c063b1))


### Bug Fixes

* **chart:** replace next/dynamic with a regular import in WeightChart ([4fd0ed1](https://github.com/r4kh4t/antarctica-am-draft/commit/4fd0ed16c7d76a2848a06958dc68e12db9f1c21c))
* **chart:** resolve TS language server module error in WeightChart dynamic import ([eb8c242](https://github.com/r4kh4t/antarctica-am-draft/commit/eb8c2420b8b99cd62930eadb63b334c0791a5bff))
* correct assetId key mapping, add algo-rationale icon, sector insight tooltips ([76b66bc](https://github.com/r4kh4t/antarctica-am-draft/commit/76b66bc308c0ffac8433acbd032d1054e37770f3))
* improve recommendation table responsiveness ([25858e7](https://github.com/r4kh4t/antarctica-am-draft/commit/25858e7a727963d464653484a56006e38ac73fec))
* normalise import path and prompt en-dashes ([c18ed41](https://github.com/r4kh4t/antarctica-am-draft/commit/c18ed41c28c70c113000d7debc96417ad5ec975d))
* resolve lint warnings in schema tests ([aaf012f](https://github.com/r4kh4t/antarctica-am-draft/commit/aaf012fe5f3b2ed8dee503f18f18268885048579))
* **tests:** resolve two tsc type errors in LLM test files ([357e1d4](https://github.com/r4kh4t/antarctica-am-draft/commit/357e1d4d9c982a1bbf02ee818084d2cbe85e92f5))


### Code Refactoring

* **design-tokens:** replace antarctica-* vars with semantic [@theme](https://github.com/theme) tokens ([6bdd26f](https://github.com/r4kh4t/antarctica-am-draft/commit/6bdd26f0ac625c5d6b3e3ea31a0b6f52ee991cf5))
* extract AI_STATUS, AiState, and API_ROUTES into src/lib/constants.ts ([74656fb](https://github.com/r4kh4t/antarctica-am-draft/commit/74656fb58c1cc05e2da2443531f2e4b5fd4b4051))


### CI / Tooling

* add commit-msg + pre-push hooks and GitHub Actions CI workflow ([175b1b1](https://github.com/r4kh4t/antarctica-am-draft/commit/175b1b1f61ab50d91661c5a5fefe1404763bbcb8))
* add Dependabot weekly updates for npm and GitHub Actions ([#9](https://github.com/r4kh4t/antarctica-am-draft/issues/9)) ([d8a6bac](https://github.com/r4kh4t/antarctica-am-draft/commit/d8a6bac3cf21ad7a993289af057e16e0a7c9d9f8))

## [Unreleased]

### Added
- `src/app/api/rationale/route.test.ts`: 3 integration tests for the POST route — success (200 + correct schema), guardrail rejection (400 without Rollbar), and upstream OpenAI failure (500 + `captureServerError` called). All external dependencies mocked with `vi.mock`.
- `vitest.config.ts`: added `resolve.alias` for `@/` → `src/` so route tests can resolve path aliases without Next.js runtime.

### Changed
- `validateRationaleRequest` now throws `ValidationError` (new named subclass of `Error` exported from `guardrails.ts`).
- `POST /api/rationale`: catches `ValidationError` and returns HTTP 400; all other errors continue to return 500 and trigger `captureServerError`.

Closes #21

---

## [1.1.2] — 2026-04-30

### Security
- `package.json`: added `overrides.postcss >= 8.5.10` to force all transitive copies of PostCSS (including `next`'s locked `8.4.31`) to the patched version `8.5.12`. Fixes Dependabot alert #1 — PostCSS XSS via unescaped `</style>` in CSS stringify output (medium severity).

---

## [1.1.1] — 2026-04-30

### Fixed
- `SectorChart`: removed `isFront` prop from `<ReferenceLine>` — the prop no longer exists in the installed version of Recharts, causing a TypeScript error. Reference lines still render above grid lines via JSX declaration order.

---

## [1.1.0] — 2026-04-30

### Added
- **Performance chart** (`AnalyticsSection` → "Performance" tab): cumulative growth-of-100 line chart per asset + dashed benchmark overlay. Controls: native `<input type="month">` date-range pickers to re-base the index to any sub-period; per-series pill toggles to show/hide individual asset lines and the benchmark.
- **Risk / Return scatter** (`AnalyticsSection` → "Risk / Return" tab): annualised volatility (X) vs annualised return (Y) scatter chart. Bubble size encodes recommended weight; colour encodes sector. Custom tooltip shows full asset details.
- **Sector chart** (`AnalyticsSection` → "Sectors" tab): grouped bar chart of sector allocation current vs recommended. Recommended bars coloured by constraint status (green = within, amber = below, red = above); dashed ceiling reference lines per sector.
- **`AnalyticsSection`**: tabbed panel (Performance / Risk-Return / Sectors) below the weight chart and methodology card.
- **`AssetMonthlyReturn` type** in `types.ts`; `assetMonthlyReturns` field added to `PortfolioRecommendation` and populated by `buildPortfolioRecommendation`.

### Changed
- **`WeightChartContent`**: replaced static Recharts `<Legend>` with interactive toggle pills for Current / Recommended bars — clicking greys out and hides the corresponding series.

---

## [1.0.0] — 2026-04-30

### Added
- **Export CSV** (`#16`): "Export CSV" button in `TableControls` downloads the current filtered/sorted table as a `.csv` file — ticker, name, asset ID, sector, region, weights, move, score, and rationale (AI or algo). No extra dependencies; uses native `Blob` + `URL.createObjectURL`. Utility lives in `src/lib/export.ts`.
- **Export CSV disabled state**: button is disabled while AI rationale is loading; hovering shows a tooltip "AI is still thinking — export will include full rationale once complete."
- `Tooltip`: added `disabled` prop to suppress the bubble without removing the wrapper.
- **Security headers** (`#24`): `next.config.ts` now ships `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`, and a `Content-Security-Policy` on every route. CSP allows Vercel Analytics/Speed Insights, Rollbar, Langfuse, and OpenAI; all other origins are blocked by default.
- **release-please** (`#25`): `.github/workflows/release-please.yml` and `release-please-config.json` automate Release PRs and GitHub Releases on every merge to `main`. Parses Conventional Commits to update `CHANGELOG.md` and bump `package.json` automatically.

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
