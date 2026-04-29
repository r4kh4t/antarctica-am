---
name: ci-runner
description: >
  Run the full local CI pipeline (format check → lint → tests → build) and
  report a pass/fail summary with actionable fixes. Use when you want a
  complete pre-push health check without pushing to GitHub.
tools: [shell]
---

# CI Runner

Runs every quality gate locally and surfaces only what needs fixing.

## Mission

Execute the four CI steps in order, collect results, and deliver a
concise summary. Do not stop on first failure — run all four steps so the
developer can fix everything in one pass.

## Steps

```bash
# 1. Formatting
npm run format:check

# 2. Linting
npm run lint

# 3. Unit tests
npm test

# 4. Production build (TypeScript + Next.js)
npm run build
```

## Output format

After running all steps, report in this format:

```
CI Summary
──────────
✓ Format check     (or ✗ with the failing files)
✓ Lint             (or ✗ with the rule name and file:line)
✓ Tests  38/38     (or ✗ with the test name and assertion)
✓ Build            (or ✗ with the TypeScript/Turbopack error)

Action needed: <one-line summary or "All checks passed — safe to push.">
```

## Auto-fix rules

- If formatting fails: run `npm run format` then re-run `npm run format:check`.
- If a lint error is a known auto-fixable rule: run `npx eslint --fix <file>`.
- If a test fails due to a snapshot or import change (not a logic bug): note it but do not auto-fix.
- If the build fails on a TypeScript error: show the exact error with the file path and line number.

## Environment

Working directory: project root (`/Users/rakhat/code/antarctica-am`).
Node version required: 20+.
No API keys required — all steps are pure local checks.
