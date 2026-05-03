---
name: pre-release-checker
description: >
  Run a structured pre-release checklist before merging to main or submitting
  the take-home assignment. Checks code quality, environment config, deployment
  readiness, and documentation completeness. Use before any production deploy
  or final submission.
tools: [shell, read_file]
---

# Pre-Release Checker

Validates the project is genuinely production-ready before it ships.

## Mission

Work through each checklist section autonomously. For each item, run the
relevant command or read the relevant file and emit ✓ / ✗ / ⚠ with a brief
finding. At the end, print a go/no-go verdict.

## Checklist

### 1. Quality gates

```bash
npm run format:check   # Biome formatting
npm run lint           # ESLint
npm test               # unit tests (~49 portfolio + LLM suites)
npm run build          # TypeScript + Next.js production build
```

### 2. Environment variables

Read `.env.example` and verify:
- `OPENAI_API_KEY` is documented with a placeholder
- `OPENAI_MODEL` default is present
- `LANGFUSE_*` vars are listed as optional
- `ROLLBAR_*` vars are listed as optional
- `.env.local` is listed in `.gitignore`

```bash
grep -c "OPENAI_API_KEY" .env.example
grep "\.env\.local" .gitignore
```

### 3. No secrets in source

```bash
# Confirm .env.local is gitignored
git check-ignore -v .env.local

# Scan for accidental key patterns (should return nothing)
grep -rn "sk-proj-" src/ --include="*.ts" --include="*.tsx"
grep -rn "sk-lf-"   src/ --include="*.ts" --include="*.tsx"
```

### 4. Git hygiene

```bash
git status           # should be clean or staged only
git log --oneline -5 # check recent commit messages follow Conventional Commits
git branch           # confirm on correct branch
```

### 5. Deployment

```bash
# Confirm Vercel project exists and is linked
npx vercel ls --scope own-x-startup 2>/dev/null | head -5
```

Check that the live URL in `README.md` resolves (read the URL and report it;
do not actually curl it — note it for manual verification).

### 6. Documentation completeness

Read and verify each file exists and has real content (not placeholder text):

- `README.md` — must include Live Deployment URL, Quick Start, Testing section
- `docs/llm-integration.md` — must describe Langfuse and Rollbar setup
- `AGENTS.md` — must describe AI usage guidance
- `.cursor/rules/` — at least one `.mdc` file present
- `.cursor/skills/` — at least three skill directories with `SKILL.md`
- `.cursor/subagents/` — at least three subagent `.md` files

```bash
ls docs/
ls .cursor/rules/
ls .cursor/skills/
ls .cursor/subagents/
```

### 7. Security headers / config

Read `next.config.ts` — note any missing security headers. No auto-fix;
flag for developer awareness.

## Output format

```
Pre-Release Report
──────────────────
Quality gates
  ✓/✗  Format check
  ✓/✗  Lint
  ✓/✗  Tests
  ✓/✗  Build

Environment
  ✓/✗  .env.example complete
  ✓/✗  .env.local is gitignored

Secrets scan
  ✓/✗  No API keys in source

Git hygiene
  ✓/✗  Working tree clean
  ✓/✗  Commit messages follow Conventional Commits

Deployment
  ✓/✗  Vercel project linked
  ⚠    Live URL: <url> (verify manually)

Documentation
  ✓/✗  README complete
  ✓/✗  Docs present
  ✓/✗  AI config committed

──────────────────
Verdict: GO  /  NO-GO
Blocking issues: <list or "None">
```

Emit NO-GO only if a quality gate fails, secrets are found in source, or
.env.local is not gitignored. All other items are warnings only.
