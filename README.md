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

`src/lib/portfolio/actualData.ts` normalises this into the app's internal shape: unique `assetId` per line (duplicate ISINs get distinct IDs and share a cloned price series), all date formats unified to `YYYY-MM-DD` via `date-fns`, weights renormalised to sum to 100%, asset class → sector for caps, and assumed turnover cap where the policy file is silent.

## Recommendation method

The brief asks to optimise on monthly returns but leaves every other decision open. Rather than a full mean-variance (Markowitz) solve — which requires a stable covariance matrix, is sensitive to estimation error on a thin monthly sample, and is opaque to non-quant stakeholders — this implementation scores each asset using a **Sharpe-like ratio**: annualised arithmetic mean of monthly returns divided by annualised monthly volatility. Proposed weights are formed by **tilting from the current book** toward higher-scoring names (bounded z-score tilt, not a full rebuild from zero), then projected onto soft constraints via iterative rescaling. Monthly returns are **arithmetic** (`P_t / P_{t-1} − 1`) using the last available daily close in each calendar month; no forward-fill is applied across missing dates. Soft constraints — per-asset floor and cap, asset-class ceilings, turnover budget — are enforced by iterative projection and normalisation rather than a constrained quadratic programme, so violations shrink but are not guaranteed to be exactly zero. The result is deterministic, fully traceable in a dozen lines of TypeScript, and every allocation decision can be explained in plain English — the right trade-off for a small stakeholder-facing fund and a take-home where the debrief matters as much as the output.

| Decision | Choice | Why |
|---|---|---|
| Objective | Sharpe-like score (return ÷ volatility) | Explainable ranking; no covariance matrix needed |
| Return definition | Arithmetic monthly, month-end close | Matches stakeholder reporting; log returns rank identically for small moves |
| Missing prices | Drop interval, no forward-fill | Forward-fill would fabricate volatility; sparse months shorten sample visibly |
| Soft constraints | Iterative projection (not QP) | Transparent, testable, no solver dependency |
| Cardinality (`max_assets`) | Documented conflict, not enforced | Simultaneous min-line-size + max-names requires mixed-integer optimisation |

See [`docs/recommendation-methodology.md`](docs/recommendation-methodology.md) for the exact formulas and implementation notes.

The UI stays thin; the portfolio layer holds the decisions worth reviewing in code review and debrief.

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

## Vercel Tools

The following free tools are integrated:

| Tool | What it does | Free tier |
|---|---|---|
| **Web Analytics** | Privacy-first page views and visitor stats — no cookies, no GDPR issues | 50,000 events/month (Hobby) |
| **Speed Insights** | Core Web Vitals (LCP, CLS, FID) per real user visit | 10,000 data points/month (Hobby) |
| **Rollbar** | Real-time error tracking for client and server, with stack traces and deploy tracking | 5,000 events/month (free forever) |

### Rollbar setup

The quickest path is through the Vercel dashboard — it auto-provisions both tokens:

1. Vercel dashboard → **Integrations** → search **Rollbar** → **Install**
2. Select your project; Rollbar creates the project and sets `NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN` and `ROLLBAR_SERVER_TOKEN` in your Vercel env vars automatically
3. Redeploy — errors start flowing immediately

For local development, copy the tokens from the Vercel dashboard into `.env.local` (see `.env.example`).

Rollbar captures:
- Uncaught browser exceptions and promise rejections (via `<RollbarProvider>` in `layout.tsx`)
- Root layout crashes (via `global-error.tsx`)
- Server-side API route failures (via `captureServerError()` in `src/lib/rollbar.ts`)

When `NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN` / `ROLLBAR_SERVER_TOKEN` are blank, Rollbar is a no-op and the app behaves normally.

**Other free observability options:**

| Integration | Purpose | Notes |
|---|---|---|
| [Checkly](https://vercel.com/integrations/checkly) | Synthetic monitoring (Playwright health checks) | Free tier available |
| [PostHog](https://vercel.com/integrations/posthog) | Session replay + product analytics | Free tier: 1M events/month |

## Next Steps

The following are tracked as open GitHub issues on [r4kh4t/antarctica-am-draft](https://github.com/r4kh4t/antarctica-am-draft/issues):

| # | Area | Description |
|---|---|---|
| [#15](https://github.com/r4kh4t/antarctica-am-draft/issues/15) | Feature | Sensitivity / what-if panel — show how weights change under stricter turnover or sector constraints |
| [#14](https://github.com/r4kh4t/antarctica-am-draft/issues/14) | Feature | Streaming AI rationale responses |
| [#19](https://github.com/r4kh4t/antarctica-am-draft/issues/19) | Feature | Configurable data source (hosted URL or local JSON) |
| [#20](https://github.com/r4kh4t/antarctica-am-draft/issues/20) | Testing | E2E tests with Playwright for the main dashboard flow |
| [#22](https://github.com/r4kh4t/antarctica-am-draft/issues/22) | Perf | Bundle size analysis and reduction |
| [#23](https://github.com/r4kh4t/antarctica-am-draft/issues/23) | Security | Rate-limit `/api/rationale` to prevent LLM cost abuse |
| Backlog | Robustness | Add Zod validation on raw `data/*.json` inputs at load time |
| Backlog | Robustness | Extend `validateRationaleRequest` to cover `summary`, `sectorExposures`, `benchmarkName` fields |
| Backlog | A11y | Add `aria-describedby` to `InfoIcon` tooltip triggers for screen-reader support |
| Backlog | Optimisation | Mixed-integer solver for cardinality (`max_assets`) combined with minimum line-size constraints |
