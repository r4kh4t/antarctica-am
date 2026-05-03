<p align="center">
  <img src="public/assets/antarctica-logo.svg" alt="Antarctica Asset Management" width="220" />
</p>

# Antarctica Portfolio Recommendation

A small production-minded Next.js application that reads portfolio data, calculates monthly return metrics, recommends revised asset weights, and presents the result in a dashboard suitable for a stakeholder debrief.

**Assessment framing:** the brief stresses that AI can support delivery but does not replace engineering judgment. The debrief is where trade-offs are evaluated; this README and `docs/recommendation-methodology.md` record the assumptions you are expected to defend (objective, return definition, missing data, soft constraints).

## Live Deployment

Vercel URL: [https://antarctica-am-draft.vercel.app](https://antarctica-am-draft.vercel.app)

The project is deployed under the `own-x-startup` Vercel team and is connected to the private GitHub repository. Vercel reports SSO deployment protection enabled for generated deployment URLs and Git fork protection enabled.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verification

```bash
npm test
npm run lint
npm run format:check
npm run build
```

Pre-commit checks are managed by Husky. Each commit runs staged-file formatting, linting, and the full unit test suite. The same steps run in CI via GitHub Actions on every push and pull request.

## Testing

**What is tested and why**

The project covers the code that is both easy to unit-test and most important to get right:

| Test file | What it covers | Why it matters |
|---|---|---|
| `src/lib/portfolio/recommendation.test.ts` | Weight scoring, constraint enforcement, turnover, total weight | Core business logic — a wrong allocation recommendation is a real risk |
| `src/lib/llm/tokens.test.ts` | `estimateTokens`, `getContextLimit`, `assertFitsContext` | Ensures the prompt never silently overflows the model context window |
| `src/lib/llm/guardrails.test.ts` | `validateRationaleRequest` input validation, `normalizeRationaleResponse` | Prevents bad data reaching the LLM and bad output reaching the UI |
| `src/lib/llm/formatters.test.ts` | Markdown table structure, asset ID inclusion, percentage formatting | The LLM's answer quality depends entirely on the data it receives |
| `src/lib/llm/schemas.test.ts` | Zod schema: valid/invalid shapes, length constraints, type inference | Confirms Instructor's structured output contract matches expectations |
| `src/lib/llm/cache.test.ts` | Cache key determinism, TTL expiry, route-level deduplication | Prevents duplicate LLM calls and confirms cost-saving behaviour |
| `src/app/api/rationale/route.test.ts` | POST 200 / 400 / 500 response paths | Catches regressions in the route's validation and error-handling logic |

**What is intentionally not tested**

- **React components** — the UI layer has no business logic; it is all straightforward conditional rendering and prop threading. Snapshot or interaction tests would be brittle without adding signal.
- **Integration tests** — calling the real OpenAI API or a live Langfuse instance in tests would be slow, expensive, and flaky. These are covered operationally: every deployment triggers a live rationale call visible in Langfuse.
- **End-to-end tests** — the app has a single page and no user flows requiring Playwright/Cypress coverage at this stage. E2E tests are tracked under [#20](https://github.com/r4kh4t/antarctica-am-draft/issues/20).
- **`observability.ts` / `instructor.ts`** — thin wrappers around well-tested third-party SDKs; testing them would mostly test the libraries themselves.

## Data

Authoritative inputs live under `data/`:

| File | Role |
|------|------|
| `holdings.json` | Lines with ISIN, name, asset class, currency, weight |
| `prices.json` | Daily tall prices (`isin`, `date`, `price` — string or number; DD/MM/YYYY, ISO datetime, and Excel serial date formats present) |
| `benchmark.json` | Daily benchmark levels |
| `constraints.json` | Min/max line size, per–asset-class caps, `max_assets` |

`src/lib/portfolio/actualData.ts` normalises this into the app's internal shape and collects a structured `DataWarning[]` describing every resolution applied, so the debrief can audit how raw input became clean input. On the current dataset this produces 12 resolved issues surfaced in the **Data Quality** panel:

- Duplicate ISIN rows merged (weights summed, first-seen name kept) so the pipeline sees one economic position per ISIN.
- Asset-class labels normalised to canonical values matching the constraint keys (`"equity"` → `"Equity"`, `"fixed-income"` / `"FI"` → `"Fixed Income"`).
- Currency aliases mapped to ISO 4217 codes (`"US$"` → `"USD"`).
- Holdings weight shortfall interpreted as unallocated cash (e.g. `0.98` sum → `"2.0% treated as unallocated cash"`); internally rescaled to 100% so downstream math is consistent.
- Price dates unified to `YYYY-MM-DD` via a single normaliser that accepts Excel serial numbers, ISO timestamps, and `DD/MM/YYYY` strings.
- Price values encoded as JSON strings coerced to numbers (the dataset has ~20% of rows in this form).
- **3-sigma outlier detection per ISIN**: values more than three population standard deviations from an ISIN's mean are flagged for review but kept in the calculations until manually excluded.
- Benchmark duplicate dates resolved with a "last entry wins" convention.
- Soft constraint caps reported where `per_asset_class_caps` sums to less than 1.

## Return calculation

Cumulative return series on the chart are **anchored to the first data point** (day one), not to the first month-end. The first partial month's change is included, so the April 2023 benchmark drawdown of −10.65% is visible in the series rather than silently discarded as part of the indexing.

Concretely, `calculateAssetMonthlyReturns` and `calculateBenchmarkMonthlyReturns` emit a monthly return series whose compounded cumulative value at any month equals `level[month_end] / level[first_data_point]` to floating-point precision. The invariant is asserted by unit tests and was verified over the full 36-month benchmark window (zero difference at every month).

Chart rendering is indexed to 100 at day one:

- **Y-axis** shows signed cumulative return (`+27.85%`, `-5%`, etc.).
- **Tooltip** shows both the indexed value and the signed percent (e.g. `127.85  (+27.85%)`).
- **Start baseline** is the dashed horizontal line at 100 representing 0% cumulative return.

This is the industry-standard time-weighted return convention. A stakeholder reading the chart at `2025-03` sees `+27.85%` — exactly `1278.55 / 1000.00 − 1` from the raw `benchmark.json` levels, no rounding.

## Recommendation method

The brief asks to optimise on monthly returns but leaves every other decision open. Rather than a full mean-variance (Markowitz) solve — which requires a stable covariance matrix, is sensitive to estimation error on a thin monthly sample, and is opaque to non-quant stakeholders — this implementation scores each asset using a **Sharpe-like ratio**: annualised arithmetic mean of monthly returns divided by annualised monthly volatility. Proposed weights are formed by **tilting from the current book** toward higher-scoring names (bounded z-score tilt, not a full rebuild from zero), then projected onto soft constraints via iterative rescaling. Monthly return construction follows `docs/recommendation-methodology.md`: a **partial first calendar month** from the first observation to that month’s month-end close when applicable, then **month-end to month-end** arithmetic links (`P_t / P_{t-1} − 1`); no forward-fill is applied across missing dates. Cumulative performance on the dashboard compounds from day one (see **Return calculation** above). Soft constraints — per-asset floor and cap, asset-class ceilings, turnover budget — are enforced by iterative projection and normalisation rather than a constrained quadratic programme, so violations shrink but are not guaranteed to be exactly zero. The result is deterministic, fully traceable in a dozen lines of TypeScript, and every allocation decision can be explained in plain English — the right trade-off for a small stakeholder-facing fund and a take-home where the debrief matters as much as the output.

| Decision | Choice | Why |
|---|---|---|
| Objective | Sharpe-like score (return ÷ volatility) | Explainable ranking; no covariance matrix needed |
| Return definition | Partial first month, then arithmetic month-end closes | Matches time-weighted convention; cumulative chart equals raw level ratio (see tests) |
| Missing prices | Drop interval, no forward-fill | Forward-fill would fabricate volatility; sparse months shorten sample visibly |
| Soft constraints | Iterative projection (not QP) | Transparent, testable, no solver dependency |
| Cardinality (`max_assets`) | Soft violation surfaced in UI when breached | Tilt + projection retains all economically relevant names unless a mixed-integer step is added; min line size × max names is inherently combinatorial |

See [`docs/recommendation-methodology.md`](docs/recommendation-methodology.md) for the exact formulas and implementation notes.

The UI stays thin; the portfolio layer holds the decisions worth reviewing in code review and debrief.

### Reviewer note — investment methodology (what “sure” means here)

**Internally consistent and auditable**

- Monthly return construction (partial first month, then month-end chain) is explicit in code and in [`docs/recommendation-methodology.md`](docs/recommendation-methodology.md). Cumulative values on the chart match the compounded series and benchmark cross-check against raw levels is covered by tests.
- The recommendation path is deterministic: same inputs (`data/*.json` after normalisation), same numeric output. Loader resolutions are enumerated in [`src/lib/portfolio/actualData.ts`](src/lib/portfolio/actualData.ts) and surfaced in **Data Quality** so nothing material is silently “fixed” without disclosure.

**Not something to ship as standalone alpha without extension**

- The headline ratio is **not** textbook Sharpe: there is **no subtraction of a risk‑free rate**. It is an explainable ranking heuristic on monthly arithmetic returns.
- There is **no covariance model** beyond what is embedded in realised portfolio histories; downside, factor, and correlation structure are **not** explicitly controlled.
- **FX** line items are labelled in the source file but are **not** converted to a single numeraire; treat cross‑currency mixes as an explicit data limitation for any live deployment.
- **Outliers** are flagged per ISIN (3‑sigma) but **remain in returns** unless data is curated — appropriate for transparency, conservative for naive backtests.

In short: the maths is internally coherent and reproducible from the artefacts in-repo; claiming “100% completeness” versus all possible modelling choices would be wrong. Anything above is a deliberate scope boundary for clarity in the debrief, not an undiscovered hole in the arithmetic.

## Application Structure

- `src/app/page.tsx`: server-rendered dashboard entry point
- `src/components/`: grouped into `dashboard/`, `chart/`, `table/`, and `shared/` subdirectories
- `src/lib/llm/`: OpenAI client, token estimation, guardrails, formatters, versioned prompts
- `src/app/api/rationale/`: POST route that generates AI rationale via GPT
- `src/lib/portfolio/`: actual-data normalisation, monthly return calculation, constraints, recommendation logic, formatting, and tests
- `docs/`: architecture, methodology, development workflow, and AI workflow notes
- `.cursor/`: project rules, hooks, and skills used to guide AI-assisted development
- `AGENTS.md`: repository-level AI guidance

## Documentation

- [Architecture](docs/architecture.md)
- [Recommendation methodology](docs/recommendation-methodology.md)
- [Development workflow](docs/development-workflow.md)
- [AI workflow](docs/ai-workflow.md)
- [Brand notes](docs/brand-notes.md)
- [LLM integration](docs/llm-integration.md)

## AI Usage

AI assistance was used to speed up scaffolding, implementation, and review. The project includes committed Cursor configuration to make that workflow explicit:

- `.cursor/rules/project-engineering.mdc`
- `.cursor/rules/next-react-boundaries.mdc`
- `.cursor/rules/portfolio-domain.mdc`
- `.cursor/rules/llm-integration.mdc`
- `.cursor/hooks.json`
- `.cursor/skills/portfolio-recommendation/SKILL.md`
- `.cursor/skills/assignment-code-review/SKILL.md`

The AI rationale feature uses OpenAI GPT-4o (configurable to o4-mini for reasoning) to generate per-asset commentary. Data is formatted as markdown tables before being sent to the model. Langfuse observability is optionally available via `.env.local`.

Generated output was validated with tests, linting, and a production build. Final implementation decisions remain intentionally simple and reviewable.

## Deployment Notes

This app is Vercel-ready. Use the default Next.js project settings:

```bash
npm run build
```

After deployment, replace the pending Vercel URL above with the live URL before submitting.

Enable **Web Analytics** and **Speed Insights** on the deployment: Vercel project → **Analytics** / **Speed Insights** → enable for the project (the SDK is already wired in `src/components/providers.tsx`).

## Vercel Tools

The following free tools are integrated:

| Tool | What it does | Free tier |
|---|---|---|
| **Web Analytics** | Privacy-first page views and visitor stats — no cookies, no GDPR issues | 50,000 events/month (Hobby); enable in project **Analytics** tab |
| **Speed Insights** | Core Web Vitals (LCP, CLS, INP) per real user visit | 10,000 data points/month (Hobby); enable in **Speed Insights** tab |
| **Rollbar** | Real-time error tracking for client and server, with stack traces and deploy tracking | 5,000 events/month (free forever) |

### Web Analytics & Speed Insights

`@vercel/analytics` and `@vercel/speed-insights` are mounted in **`src/components/providers.tsx`** (same client tree as Rollbar). Turn them on in the Vercel dashboard for your project, then redeploy if needed so data starts flowing.

### Rollbar setup

The quickest path is through the Vercel dashboard — it auto-provisions both tokens:

1. Vercel dashboard → **Integrations** → search **Rollbar** → **Install**
2. Select your project; Rollbar creates the project and sets `NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN` and `ROLLBAR_SERVER_TOKEN` in your Vercel env vars automatically
3. Redeploy — errors start flowing immediately

For local development, copy the tokens from the Vercel dashboard into `.env.local` (see `.env.example`).

Rollbar captures:
- Uncaught browser exceptions and promise rejections (via `<RollbarProvider>` in `providers.tsx`)
- Root layout crashes (via `global-error.tsx`)
- Server-side API route failures (via `captureServerError()` in `src/lib/rollbar.ts`)

When `NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN` / `ROLLBAR_SERVER_TOKEN` are blank, Rollbar is a no-op and the app behaves normally.

**Other free observability options:**

| Integration | Purpose | Notes |
|---|---|---|
| [Checkly](https://vercel.com/integrations/checkly) | Synthetic monitoring (Playwright health checks) | Free tier available |
| [PostHog](https://vercel.com/integrations/posthog) | Session replay + product analytics | Free tier: 1M events/month |

## Roadmap and next steps

**Engineering backlog (authoritative)**

All technical work items — tests, tooling, accessibility, optimisation, solver experiments, APIs — live in **[GitHub Issues](https://github.com/r4kh4t/antarctica-am-draft/issues)** for labeling, sequencing, and discussion. What follows below is illustrative; Open + Backlog tabs on that page are the source of truth.

**Product and research prompts (conversation starters for the debrief)**

- Scenario / sensitivity views on constraints and turnover
- Hosted or selectable input files for repeatability demos
- How far to extend the optimisation engine (cardinality, FX model, covariance) before diminishing returns versus transparency

Representative Issues (subset):

| # | Area | Description |
|---|---|---|
| [#15](https://github.com/r4kh4t/antarctica-am-draft/issues/15) | Feature | Sensitivity / what-if panel — show how weights change under stricter turnover or sector constraints |
| [#14](https://github.com/r4kh4t/antarctica-am-draft/issues/14) | Feature | Streaming AI rationale responses |
| [#19](https://github.com/r4kh4t/antarctica-am-draft/issues/19) | Feature | Configurable data source (hosted URL or local JSON) |
| [#20](https://github.com/r4kh4t/antarctica-am-draft/issues/20) | Testing | E2E tests with Playwright for the main dashboard flow |
| [#22](https://github.com/r4kh4t/antarctica-am-draft/issues/22) | Perf | Bundle size analysis and reduction |
| [#23](https://github.com/r4kh4t/antarctica-am-draft/issues/23) | Security | Rate-limit `/api/rationale` to prevent LLM cost abuse |
| Backlog | Robustness | Extend regression coverage around loader corner cases (`actualData.ts`, date/price coercion) |
| Backlog | Robustness | Extend `validateRationaleRequest` to cover `summary`, `sectorExposures`, `benchmarkName` fields |
| Backlog | A11y | Add `aria-describedby` to `InfoIcon` tooltip triggers for screen-reader support |
| Backlog | Optimisation | Mixed-integer solver for cardinality (`max_assets`) combined with minimum line-size constraints |
