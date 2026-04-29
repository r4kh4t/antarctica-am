# Development Workflow

## Local Commands

```bash
npm run dev
npm test
npm run lint
npm run format:check
npm run build
```

## Pre-Commit Hook

Husky runs `npm run precommit` before each commit.

That script runs:

1. `lint-staged` to format staged TypeScript, JavaScript, JSON, Markdown, and CSS files with Prettier.
2. `npm run lint` to catch code quality issues.
3. `npm test` to run the portfolio unit tests.

This keeps formatting and calculation regressions out of the commit history.

## Commit Strategy

The preferred commit sequence is:

1. Scaffold the app.
2. Add generated fixture data.
3. Implement portfolio calculations.
4. Add calculation tests.
5. Build the dashboard UI.
6. Add AI workflow configuration.
7. Document methodology and delivery.
8. Prepare deployment.

For the final submission repository, replay only clean, reviewed commits.
