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

Pre-commit checks are managed by Husky. Each commit runs staged-file formatting, linting, and unit tests through `npm run precommit`.

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
- `src/components/`: presentational dashboard components and chart
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

## AI Usage

AI assistance was used to speed up scaffolding, implementation, and review. The project includes committed Cursor configuration to make that workflow explicit:

- `.cursor/rules/project-engineering.mdc`
- `.cursor/rules/next-react-boundaries.mdc`
- `.cursor/rules/portfolio-domain.mdc`
- `.cursor/hooks.json`
- `.cursor/skills/portfolio-recommendation/SKILL.md`
- `.cursor/skills/assignment-code-review/SKILL.md`

Generated output was validated with tests, linting, and a production build. Final implementation decisions remain intentionally simple and reviewable.

## Deployment Notes

This app is Vercel-ready. Use the default Next.js project settings:

```bash
npm run build
```

After deployment, replace the pending Vercel URL above with the live URL before submitting.

## Next Improvements

- Replace generated fixtures with the original hosted JSON files if the URLs become available.
- Add a small assumptions panel with links to raw data files.
- Add a sensitivity view showing how the recommendation changes under stricter turnover or sector constraints.
