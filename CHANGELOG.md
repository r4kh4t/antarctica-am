# Changelog

All notable changes to this project are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).  
Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/).

Versioning rule: bump `package.json` **and** add a changelog entry in the same commit.

---

## [1.13.0](https://github.com/r4kh4t/antarctica-am/compare/antarctica-portfolio-recommendation-v1.12.0...antarctica-portfolio-recommendation-v1.13.0) (2026-05-03)


### Features

* actual data ([bcf1219](https://github.com/r4kh4t/antarctica-am/commit/bcf1219f86bed75d603ba19aff31b22c64a3a380))
* add Biome, Instructor+Zod structured outputs, and 38 unit tests ([3b85d0f](https://github.com/r4kh4t/antarctica-am/commit/3b85d0fc3bd3ee3ba9e022b23d206461db061975))
* add GPT rationale generation, pill filters, skeleton loading, component grouping ([3aa8ef0](https://github.com/r4kh4t/antarctica-am/commit/3aa8ef00e17a6ce7c4430b70cca4c6f7001a81e2))
* add recommendation table controls ([3f86ff4](https://github.com/r4kh4t/antarctica-am/commit/3f86ff472bf8a508784007c26f48c55af3049a24))
* analytics charts — performance line, risk-return scatter, sector bar ([d06ec40](https://github.com/r4kh4t/antarctica-am/commit/d06ec40e15dc63c9d04407eea857a466192a0bf6))
* **analytics:** add Vercel Web Analytics and Speed Insights ([35aa998](https://github.com/r4kh4t/antarctica-am/commit/35aa998ab77cb33792a8585df65bddfc2070372d))
* build portfolio recommendation app ([74d7784](https://github.com/r4kh4t/antarctica-am/commit/74d778497196a59089c04ba85e0c4ef89c5fa52b))
* CSV export, security headers, release-please ([#16](https://github.com/r4kh4t/antarctica-am/issues/16) [#24](https://github.com/r4kh4t/antarctica-am/issues/24) [#25](https://github.com/r4kh4t/antarctica-am/issues/25)) ([926715e](https://github.com/r4kh4t/antarctica-am/commit/926715e4850cfd63feb8e3633b746bd28715c240))
* **data:** stronger data quality coverage and dev-server stability ([85de72c](https://github.com/r4kh4t/antarctica-am/commit/85de72c796ac8892493ac2adbac8b1779564d31d))
* **data:** Zod validation on raw JSON inputs in actualData.ts ([#38](https://github.com/r4kh4t/antarctica-am/issues/38)) ([393ed40](https://github.com/r4kh4t/antarctica-am/commit/393ed403e9870c7af4577fddfd3e4b83fcae0fcd))
* disable Export CSV while AI is loading, add tooltip ([54d25ad](https://github.com/r4kh4t/antarctica-am/commit/54d25adf55da8e74544bcc59b375d51a6ea6a386))
* in-process rationale cache with 1-hour TTL ([5ede21c](https://github.com/r4kh4t/antarctica-am/commit/5ede21cf42fde41175afb3ec87654ca54b6be93b))
* in-process rationale cache with 1-hour TTL ([#18](https://github.com/r4kh4t/antarctica-am/issues/18)) ([38b28fc](https://github.com/r4kh4t/antarctica-am/commit/38b28fcbc9cba7178ece8da6fbedd34143f86008))
* **monitoring:** add Rollbar error tracking (client + server) ([ef66507](https://github.com/r4kh4t/antarctica-am/commit/ef665073adf15357afd0f0ed695c62982f0492f3))
* **observability:** replace manual Langfuse tracing with observeOpenAI integration ([004a370](https://github.com/r4kh4t/antarctica-am/commit/004a370efed8e83d8f3a15f282ce6c87ff47fb1a))
* rationale cache, route tests, Vitest alias fix ([#18](https://github.com/r4kh4t/antarctica-am/issues/18) [#21](https://github.com/r4kh4t/antarctica-am/issues/21)) ([658a61e](https://github.com/r4kh4t/antarctica-am/commit/658a61e2faab366aaf04d439b38d97907cb13ae2))
* render backtick spans as bold in rationale and narrative text ([0db451e](https://github.com/r4kh4t/antarctica-am/commit/0db451ee18b13ddb1e8d35d50ffef75a79c063b1))
* **ui:** compact two-column Decision summary (v1.5.1); milestone v1.6.0 ([fcb88ad](https://github.com/r4kh4t/antarctica-am/commit/fcb88ada33e2595428d338f6904e6a5f1f1d7a53))
* **ui:** formula and policy highlighting; holdings-only Funds list ([de71b96](https://github.com/r4kh4t/antarctica-am/commit/de71b96d0f354db60a9aa137345848eeabbf95b7))
* **ui:** richer Decision summary, portal tooltips with border ([e693323](https://github.com/r4kh4t/antarctica-am/commit/e693323a141ac51dbdd020cb3c57a86464e4da91))
* **ui:** show value + % in chart tooltip, honest constraint status in decision summary ([cdb8bd9](https://github.com/r4kh4t/antarctica-am/commit/cdb8bd93f8655c30eaf79ea5352e2021a70d6dc0))


### Bug Fixes

* **chart:** replace next/dynamic with a regular import in WeightChart ([4fd0ed1](https://github.com/r4kh4t/antarctica-am/commit/4fd0ed16c7d76a2848a06958dc68e12db9f1c21c))
* **chart:** resolve TS language server module error in WeightChart dynamic import ([eb8c242](https://github.com/r4kh4t/antarctica-am/commit/eb8c2420b8b99cd62930eadb63b334c0791a5bff))
* correct assetId key mapping, add algo-rationale icon, sector insight tooltips ([76b66bc](https://github.com/r4kh4t/antarctica-am/commit/76b66bc308c0ffac8433acbd032d1054e37770f3))
* improve recommendation table responsiveness ([25858e7](https://github.com/r4kh4t/antarctica-am/commit/25858e7a727963d464653484a56006e38ac73fec))
* normalise import path and prompt en-dashes ([c18ed41](https://github.com/r4kh4t/antarctica-am/commit/c18ed41c28c70c113000d7debc96417ad5ec975d))
* remove isFront prop from ReferenceLine in SectorChart ([df2021e](https://github.com/r4kh4t/antarctica-am/commit/df2021e76984be7ce426e5c52fe59ed24588b789))
* resolve lint warnings in schema tests ([aaf012f](https://github.com/r4kh4t/antarctica-am/commit/aaf012fe5f3b2ed8dee503f18f18268885048579))
* **security:** force postcss &gt;=8.5.10 via npm overrides (Dependabot [#1](https://github.com/r4kh4t/antarctica-am/issues/1)) ([ef37e9b](https://github.com/r4kh4t/antarctica-am/commit/ef37e9b9ff0c8a72f71463247b255240eec1fa4e))
* **tests:** resolve two tsc type errors in LLM test files ([357e1d4](https://github.com/r4kh4t/antarctica-am/commit/357e1d4d9c982a1bbf02ee818084d2cbe85e92f5))
* **test:** Vitest alias portability, route integration tests, ValidationError 400 ([28c8035](https://github.com/r4kh4t/antarctica-am/commit/28c80352b26cdf1c731a2803800c4bc5ce81061b))


### Code Refactoring

* **design-tokens:** replace antarctica-* vars with semantic [@theme](https://github.com/theme) tokens ([6bdd26f](https://github.com/r4kh4t/antarctica-am/commit/6bdd26f0ac625c5d6b3e3ea31a0b6f52ee991cf5))
* extract AI_STATUS, AiState, and API_ROUTES into src/lib/constants.ts ([74656fb](https://github.com/r4kh4t/antarctica-am/commit/74656fb58c1cc05e2da2443531f2e4b5fd4b4051))


### Tests

* integration tests for POST /api/rationale ([59b7c68](https://github.com/r4kh4t/antarctica-am/commit/59b7c684f7f540a7dff23e7605471f2b449c7f4a))
* integration tests for POST /api/rationale ([#21](https://github.com/r4kh4t/antarctica-am/issues/21)) ([359c8c3](https://github.com/r4kh4t/antarctica-am/commit/359c8c3b92826dd5f17c94d3877504f8db43cd5c))


### CI / Tooling

* add commit-msg + pre-push hooks and GitHub Actions CI workflow ([175b1b1](https://github.com/r4kh4t/antarctica-am/commit/175b1b1f61ab50d91661c5a5fefe1404763bbcb8))
* add Dependabot weekly updates for npm and GitHub Actions ([#9](https://github.com/r4kh4t/antarctica-am/issues/9)) ([d8a6bac](https://github.com/r4kh4t/antarctica-am/commit/d8a6bac3cf21ad7a993289af057e16e0a7c9d9f8))
* move release-branch-name into package config (must be package-level) ([0813dfd](https://github.com/r4kh4t/antarctica-am/commit/0813dfd928818fa3b717e2b3d04f5953cb64bc88))
* set release-please branch name to chore/release ([42a91fb](https://github.com/r4kh4t/antarctica-am/commit/42a91fb18bf36cf5abbbd841d956799f2d1685d0))

## [1.12.0] — 2026-05-03

### Changed (UI)

- `PerformanceChart`: **Funds** dropdown lists **holdings only** (e.g. 10 lines); benchmark is toggled under **Portfolio** only. Benchmark index name appears as the subtitle under **Benchmark** in the Portfolio menu.
- `MethodologyCard`: monthly return arithmetic is styled as an inline **`code`** chip (`r = P(end)/P(prev) - 1`) for readability.
- `PortfolioDashboard`: **`constraints.json`** in the hero objective is shown as a highlighted monospace pill (tooltip: policy file lives at `data/constraints.json`).

### Changed

- `actualData.ts` hero objective copy no longer wraps the filename in Markdown backticks; the dashboard renders the highlight.
- **Vercel Web Analytics** and **Speed Insights** (`@vercel/analytics`, `@vercel/speed-insights`) are mounted in **`providers.tsx`** alongside Rollbar; README documents enabling both in the Vercel project dashboard.

---

## [1.11.0] — 2026-05-03

### Added

- `actualData.ts` now **merges duplicate ISIN rows** at load time (sums weights, keeps first-seen name) rather than carrying them as two separate assets. The downstream pipeline (price join, optimizer, constraint compliance) now sees one economic position per ISIN.
- **Currency normalization is applied, not just flagged**: `"US$"` and similar aliases are converted to their ISO 4217 codes in the holdings record. New `normalizeCurrencyCode` helper with a mapping for `US$`, `$`, `€`, `£`, `¥`.
- **3-sigma price outlier detection per ISIN**: population mean/std is computed for each ISIN's price series and values beyond 3σ are flagged with a preview of the outlier values. Outliers are flagged for analyst review but NOT excluded from calculations.
- **String-encoded price detection**: prices serialised as JSON strings rather than numbers are counted and surfaced as a data quality warning. Coercion via `parseFloat` continues to happen silently in `parseClose` so math is unaffected.
- Weight-sum warning resolution text now reads `"X% treated as unallocated cash"` rather than `"Scaled by N× to 100%"`. The shortfall interpretation is financially more meaningful for a debrief; internal normalisation still scales to 100% so downstream calculations are unchanged.

### Changed

- With merged duplicates, `computeConstraintCompliance` sees 10 unique active holdings (down from 11). The existing note about tilt-based vs hard selection still applies.
- `public/data/*.json` refreshed so source-badge links in the Data Quality panel open the same files the pipeline reads.

### Fixed

- `PerformanceChart` now defaults the `rows` prop to `[]` and makes it optional in the type. Prevents a transient Fast Refresh crash (`Cannot read properties of undefined (reading 'reduce')`) when a stale client bundle renders the chart before a new prop has propagated.

### Changed (UI)

- `PerformanceChart` y-axis now displays cumulative return as a signed percentage (`+23%`, `-5%`) instead of raw indexed values. Tooltip shows **both** the indexed value and the signed percent (e.g. `123.45 (+23.45%)`) so the scale and the performance read are visible at the same time. Internal arithmetic is unchanged — series are still compounded on a 100-base for correctness.
- Decision Summary "Constraint status" now honestly reflects **all three** soft checks (max-assets cardinality, weight bounds, asset-class caps). Previously the field only looked at sector exposures and would read `"Within soft constraints"` even when max-assets was violated. New display is `"N of 3 violated"` with colour coding (green / amber / red) and a subtitle pointing to the Data Quality panel for detail. Underlying `summary.constraintStatus` logic and type are unchanged for backward compatibility; the dashboard now derives the richer display from `constraintCompliance` directly.

### Changed (math)

- `calculateAssetMonthlyReturns` and `calculateBenchmarkMonthlyReturns` now include a **partial first-month return** (first observation → first month-end) in addition to the standard month-over-month returns. Chart series are now anchored to the very first data point (day one) rather than to the first month-end, which is industry-standard for time-weighted return reporting and captures the full drawdown/gain an investor would experience. New `monthlyReturnsSeries` helper encapsulates the logic.
- Verified against raw benchmark data: the compounded cumulative series now equals `level[month_end] / level[first_data_point]` to floating-point precision at every month (zero difference across the full 36-month window).
- Previously the first-month partial return was silently discarded, producing a cumulative series anchored to the first month-end. With the April 2023 benchmark drawdown of -10.65% that caused our series to read `+43.09%` at 2025-03 when the true time-weighted return from 2023-04-05 is `+27.85%`.
- New tests in `recommendation.test.ts`: partial first-month expectation and the two-observation-same-month edge case.

### Tooling

- `npm run dev` and `npm run build` now set `NODE_OPTIONS=--max-old-space-size=8192` (8 GB) to avoid the default V8 heap ceiling during long-running Turbopack dev sessions with the large `prices.json` import. Added `npm run dev:big` (16 GB) for anyone hitting OOM on very long sessions.

## [1.10.0] — 2026-05-03

### Added

- `RecommendationRow` and `Asset` now carry an `isin` field threaded from the raw holdings JSON through `actualData.ts` → `recommendation.ts` → the table.
- ISIN displayed in the recommendation table under each asset name (monospace, muted) — both desktop and mobile card views.
- `computeConstraintCompliance` now de-duplicates rows by ISIN before counting active holdings, so the duplicate `NTA002E0002` entry no longer inflates the count. Displays as "10 unique holdings / 5 limit" with an inline note explaining the tilt-based optimizer retains all holdings (vs a hard Sharpe-selection step).
- `ConstraintCompliance.maxAssets` carries a `note` string surfaced in the Data Quality panel; amber ⚠ (not red ✗) is used for the soft max-assets violation to distinguish it from hard constraint failures.

## [1.9.0] — 2026-05-03

### Added

- `PerformanceChart`: new **Portfolio** filter dropdown showing three aggregated series — Benchmark (dashed), Current Portfolio (amber, weighted at current weights), and Recommended (green, weighted at recommended weights). Each series is computed from the same monthly return data used for individual asset lines.
- `PerformanceChart`: **Benchmark moved to the top** of the Funds dropdown (previously at the bottom after a divider), making it the most prominent reference series.
- Both Portfolio and Funds dropdowns share a single `hiddenSeries` state so toggling Benchmark in either filter reflects instantly in the other.
- `PerformanceChart` accepts a new `rows` prop (passed from `AnalyticsSection`) to derive current and recommended portfolio weights for the aggregate calculations.

## [1.8.0] — 2026-05-03

### Added

- `DataQualitySummary` component: collapsible panel (collapsed by default) that surfaces all 9 data issues resolved at load time — duplicate ISIN, asset class normalizations, non-standard currency, weight scaling, price date format variants, benchmark duplicate dates, and constraint cap gap. Color-coded `[source]` badges link to the corresponding raw JSON file in `public/data/`. Resolution text upgraded to `font-semibold text-ink` for better readability.
- `public/data/`: holdings, prices, benchmark, and constraints JSON files exposed as static assets so source badges in the Data Quality panel can link directly to the raw inputs.
- Constraint compliance section inside `DataQualitySummary`: ✓/✗ per rule (max assets, weight bounds `[2%–25%]`, asset class caps 30%) computed from the live recommendation output.
- AI disclaimer tooltips on the AI-enhanced badge, the narrative paragraph, and every AI-sourced rationale cell in `RecommendationTable` — noting content is LLM-generated and may not be accurate.
- `DataWarning` and `ConstraintCompliance` types added to `src/lib/portfolio/types.ts`.
- `maxAssets` field added to the `Constraints` type and threaded through `actualData.ts` → `data.ts` → `recommendation.ts` → `PortfolioRecommendation`.

## [1.7.1] — 2026-05-03

### Added

- `actualData.ts`: four Zod schemas (`RawHoldingSchema`, `RawPriceRowSchema`, `RawBenchmarkLevelSchema`, `RawConstraintFileSchema`) validate the raw JSON inputs at load time. Replaces the previous `as` casts — a shape mismatch now surfaces a typed `ZodError` with a precise field path instead of a silent runtime failure downstream. Types for `RawHolding`, `RawPriceRow`, `RawConstraintFile` are now inferred from the schemas via `z.infer<>`. Closes #38.

## [1.7.0] — 2026-05-03

### Fixed

- `src/lib/llm/client.ts`: removed dead `getOpenAIClient` export — nothing imported it; callers should use `getTracedOpenAIClient` or `getInstructorClient`.
- `src/lib/constants.ts`: removed dead `AiStatus` type export — only `AI_STATUS` (value) and `AiState` (union type) are consumed.
- `src/lib/portfolio/actualData.ts`: benchmark level dates now go through `normalizeDateString` for consistent `asOf` calculation and month alignment with the price series.
- `src/app/api/rationale/route.ts`: replaced `result!` non-null assertion (which TypeScript couldn't narrow across the two model branches) with an IIFE that returns a typed `{ result, totalTokens }` object.
- `docs/architecture.md`: removed deleted `WeightChart.tsx` references; updated component table and data-flow diagram to match current code; added cache and analytics entries.
- `.cursor/rules/llm-integration.mdc`: corrected `getOpenAIClient` → `getTracedOpenAIClient`/`getInstructorClient`; corrected `validateRationaleResponse` → `normalizeRationaleResponse`; corrected `traceLLMCall`/`langfuse.ts` → `observeOpenAI`/`observability.ts`.
- `docs/development-workflow.md`: test count updated from 38 → 48; added `skip-changelog` label bypass note.
- `docs/ai-workflow.md`: fixed `.cursor/hooks/hooks.json` path → `.cursor/hooks.json` + `.cursor/hooks/`.

### Added

- `src/components/table/types.ts`: extracted `SortKey`, `SortDirection`, `MoveFilter` from `RecommendationTable.tsx` and `TableControls.tsx` (duplicate definitions) into one shared file.
- `README.md`: **Next Steps** section listing open GitHub issues aligned with audit findings.
- GitHub issues [#37](https://github.com/r4kh4t/antarctica-am-draft/issues/37), [#38](https://github.com/r4kh4t/antarctica-am-draft/issues/38), [#39](https://github.com/r4kh4t/antarctica-am-draft/issues/39) — guardrails gap, Zod input validation, and a11y tooltip fix.

## [1.6.7] — 2026-05-03

### Added

- `PerformanceChart`: replaced two separate month dropdowns with a single `MonthRangePicker` — a two-click range selector showing a year × month grid; months with no price data are greyed out with a CSS hover tooltip explaining why; a `?` InfoIcon in the panel header shows the same explanation via the shared `HoverTooltip`.
- `PortfolioDashboard`: footer with year (2026), author name, and contact email `rahateamfor@gmail.com`.

## [1.6.6] — 2026-05-03

### Added

- `date-fns` dependency for consistent date parsing and formatting.

### Changed

- `actualData.ts` / `normalizeInputDate`: `DD/MM/YYYY` entries now parsed with `date-fns` `parse` + `format` instead of manual string splitting; Excel serial and ISO datetime cases retain their string-slice approach to avoid UTC→local timezone shifts.
- `PerformanceChart` / `formatMonthLabel`: replaced hand-rolled month-name array with `date-fns` `format(new Date(year, mon-1, 1), "MMM ''yy")`; uses local-date constructor to avoid UTC midnight timezone roll-back.

## [1.6.5] — 2026-05-03

### Fixed

- `actualData.ts` / `normalizeInputDate`: handles all four date formats found in `prices_actual.json` — ISO date (`YYYY-MM-DD`), ISO datetime with TZ (`YYYY-MM-DDTHH:MM:SSZ`), Excel serial, and `DD/MM/YYYY`. Previously, the latter two were passed through unchanged, producing garbage month keys like `"28/07/2"` and garbled X-axis labels.
- `PerformanceChart` / `formatMonthLabel`: validates input is well-formed `YYYY-MM` before formatting; returns the raw string instead of `"undefined '/07/2..."` on malformed input.

### Changed

- `PerformanceChart`: removed "Above 100 — capital growth / Below 100 — capital at risk / Baseline (100)" zone legend (background colours remain in the chart).

### Removed

- `src/components/chart/WeightChart.tsx`: dead code — `WeightChartContent` is now used directly everywhere; wrapper component was never imported outside of the barrel file.
- `src/components/chart/index.ts`: removed `WeightChart` re-export.

## [1.6.4] — 2026-05-03

### Changed

- `README.md`: "Recommendation method" section rewritten with a full one-paragraph rationale and a decision table (objective, return definition, missing data, constraints, cardinality).
- `AGENTS.md`: new `## Optimisation rationale` section with the same paragraph for AI-assisted work context.
- `.cursor/rules/portfolio-domain.mdc`: rationale paragraph added at the top; last rule now requires updating all three locations when the scoring method changes.

## [1.6.3] — 2026-05-03

### Changed

- `PortfolioDashboard`: Decision Summary items now each have an `InfoIcon` tooltip explaining the metric; removed the duplicate KPI card row that repeated the same numbers.
- `PortfolioDashboard`: Allocation chart and Sector-exposure constraints merged into one combined card; Methodology is a standalone card beside it — replaces the previous two-level nested grid that left excess whitespace.
- `MethodologyCard`: simplified to render only the dark methodology panel; constraints panel moved into `PortfolioDashboard`.

## [1.6.2] — 2026-05-03

### Fixed

- Recharts: set `initialDimension`, `minWidth={0}`, and `minHeight` on `ResponsiveContainer` plus `min-w-0` / `min-h-0` chart shells so first paint/SSR no longer logs negative width/height.
- `PortfolioDashboard` header: `Image` logo uses `h-12 w-auto` to satisfy Next.js aspect-ratio warning when constraining one dimension.

## [1.6.1] — 2026-05-03

### Changed

- `AGENTS.md`: restore concise, production-style guidance for AI-assisted work.

## [1.6.0] — 2026-05-03

### Added

- `src/lib/portfolio/actualData.ts`: loads `data/*`, maps the author JSON schema to internal portfolio types, coerces Excel serial dates and string prices, renormalises weights, duplicates shared-ISIN price rows per holdings line.

### Changed

- `src/lib/portfolio/data.ts`: portfolio inputs come from normalised actual data instead of root `data/*.json` fixtures.
- `src/lib/portfolio/recommendation.ts`: methodology strings document arithmetic monthly returns, sparse history, and iterative soft-constraint handling.
- `README.md`, `AGENTS.md`, `docs/recommendation-methodology.md`, `docs/architecture.md`, `.cursor/skills/portfolio-recommendation/SKILL.md`, `.cursor/skills/debug/SKILL.md`: debrief-first framing and explicit modelling assumptions.

## [1.5.0](https://github.com/r4kh4t/antarctica-am-draft/compare/antarctica-portfolio-recommendation-v1.4.0...antarctica-portfolio-recommendation-v1.5.0) (2026-04-29)


### Features

* **ui:** richer Decision summary, portal tooltips with border ([e693323](https://github.com/r4kh4t/antarctica-am-draft/commit/e693323a141ac51dbdd020cb3c57a86464e4da91))

## [1.5.1] — 2026-04-30

### Changed

- `PortfolioDashboard`: Decision summary uses a **two-column** compact grid (`grid-cols-2`), smaller type, tighter padding (`p-5`), and `min-w-0` / `truncate` so long benchmark names layout cleanly.
- GitHub: open milestone retitled from `v1.5.0 — Next` to **`v1.6.0 — Next`** (backlog issues on that milestone).
- `.cursor/rules/github-workflow.mdc`: milestone table and `gh issue create` examples now use `v1.6.0 — Next`.

## [1.4.1] — 2026-04-30

### Changed

- `PortfolioDashboard`: Decision summary adds excess vs benchmark, annualised volatility, turnover, benchmark level with index name, and count of names with material weight changes.
- `Tooltip`: bubble renders in a `document.body` portal with `position: fixed` so it is not clipped by `overflow-hidden` parents; added `ring-1 ring-primary/45`; repositions on scroll/resize.

## [1.4.0](https://github.com/r4kh4t/antarctica-am-draft/compare/antarctica-portfolio-recommendation-v1.3.0...antarctica-portfolio-recommendation-v1.4.0) (2026-04-29)


### Features

* rationale cache, route tests, Vitest alias fix ([#18](https://github.com/r4kh4t/antarctica-am-draft/issues/18) [#21](https://github.com/r4kh4t/antarctica-am-draft/issues/21)) ([658a61e](https://github.com/r4kh4t/antarctica-am-draft/commit/658a61e2faab366aaf04d439b38d97907cb13ae2))


### Bug Fixes

* **test:** Vitest alias portability, route integration tests, ValidationError 400 ([28c8035](https://github.com/r4kh4t/antarctica-am-draft/commit/28c80352b26cdf1c731a2803800c4bc5ce81061b))

## [1.3.0](https://github.com/r4kh4t/antarctica-am-draft/compare/antarctica-portfolio-recommendation-v1.2.3...antarctica-portfolio-recommendation-v1.3.0) (2026-04-29)


### Features

* in-process rationale cache with 1-hour TTL ([5ede21c](https://github.com/r4kh4t/antarctica-am-draft/commit/5ede21cf42fde41175afb3ec87654ca54b6be93b))
* in-process rationale cache with 1-hour TTL ([#18](https://github.com/r4kh4t/antarctica-am-draft/issues/18)) ([38b28fc](https://github.com/r4kh4t/antarctica-am-draft/commit/38b28fcbc9cba7178ece8da6fbedd34143f86008))


### Tests

* integration tests for POST /api/rationale ([59b7c68](https://github.com/r4kh4t/antarctica-am-draft/commit/59b7c684f7f540a7dff23e7605471f2b449c7f4a))
* integration tests for POST /api/rationale ([#21](https://github.com/r4kh4t/antarctica-am-draft/issues/21)) ([359c8c3](https://github.com/r4kh4t/antarctica-am-draft/commit/359c8c3b92826dd5f17c94d3877504f8db43cd5c))

## [Unreleased]

### Added
- `src/app/api/rationale/route.test.ts`: 3 integration tests for the POST route — success (200), guardrail rejection (400 without Rollbar), and upstream OpenAI failure (500 + `captureServerError`).
- `src/lib/llm/cache.ts`: in-process rationale cache using a module-level Map with 1-hour TTL. Exposes `buildRationaleCacheKey` (SHA-256, key-order stable), `getCachedRationale`, `setCachedRationale`, and `clearRationaleCache` (for tests).
- `src/lib/llm/cache.test.ts`: 7 unit / integration tests — hash determinism, get/set/expiry, and a route-level test verifying OpenAI is called only once for identical payloads.

### Changed
- `POST /api/rationale`: catches `ValidationError` from guardrails and returns HTTP 400 without calling Rollbar; upstream errors remain HTTP 500 + `captureServerError`.
- `validateRationaleRequest` now throws `ValidationError` (exported from `guardrails.ts`).
- `POST /api/rationale`: checks the cache before calling OpenAI; stores the response after a cache miss; returns `cached: true` in the JSON body on a hit.

### Fixed
- `vitest.config.ts`: `@/` → `src/` alias uses `process.cwd()` (not `__dirname`) so Vitest resolves imports when the config runs in an ESM graph without `__dirname`.

Closes #18. Closes #21.

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
