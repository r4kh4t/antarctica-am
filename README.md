<p align="center">
  <img src="public/assets/antarctica-logo.svg" alt="Antarctica Asset Management" width="220" />
</p>

# Antarctica Portfolio Recommendation

A small production-minded Next.js application that reads portfolio data, calculates monthly return metrics, recommends revised asset weights, and presents the result in a dashboard suitable for a stakeholder debrief.

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

**What is intentionally not tested**

- **React components** — the UI layer has no business logic; it is all straightforward conditional rendering and prop threading. Snapshot or interaction tests would be brittle without adding signal.
- **Integration tests** — calling the real OpenAI API or a live Langfuse instance in tests would be slow, expensive, and flaky. These are covered operationally: every deployment triggers a live rationale call visible in Langfuse.
- **End-to-end tests** — the app has a single page and no user flows requiring Playwright/Cypress coverage at this stage. E2E tests are the right next step once the scope grows.
- **`client.ts` / `instructor.ts`** — these are thin wrappers around well-tested third-party SDKs. Testing them would mostly test the libraries themselves, not business logic.

## Data

The assignment brief references four public JSON URLs, but the local brief provided in this repository did not include the actual URLs. To keep the app self-contained and reviewable, this submission uses deterministic generated fixtures:

- `data/holdings.json`: current portfolio weights and asset metadata
- `data/prices.json`: daily asset prices in tall format
- `data/benchmark.json`: daily benchmark levels
- `data/constraints.json`: soft business constraints

The generated data is fictional and designed to exercise the recommendation logic, constraint handling, charting, and debrief discussion.

## Recommendation Method

The brief says to optimise on monthly returns but intentionally leaves the objective open. I chose a pragmatic, explainable method:

1. Convert daily prices and benchmark levels into month-end series.
2. Calculate monthly returns per asset.
3. Score each asset using annualised return divided by annualised volatility.
4. Tilt away from current weights toward stronger risk-adjusted assets.
5. Apply soft constraints for max/min asset weight, sector ranges, turnover, and total weight.
6. Return a rationale for each asset so a colleague can understand why it was increased, reduced, or held.

This is deliberately not a black-box optimiser. For a small internal fund and a take-home exercise, the recommendation should be easy to inspect, test, and explain.

## Application Structure

- `src/app/page.tsx`: server-rendered dashboard entry point
- `src/components/`: grouped into `dashboard/`, `chart/`, `table/`, and `shared/` subdirectories
- `src/lib/llm/`: OpenAI client, token estimation, guardrails, formatters, versioned prompts
- `src/app/api/rationale/`: POST route that generates AI rationale via GPT
- `src/lib/portfolio/`: data loading, monthly return calculation, constraints, recommendation logic, formatting, and tests
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

## Next Improvements

- Replace generated fixtures with the original hosted JSON files if the URLs become available.
- Add a small assumptions panel with links to raw data files.
- Add a sensitivity view showing how the recommendation changes under stricter turnover or sector constraints.
