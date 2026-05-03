# Development Workflow

## Local Commands

```bash
npm run dev            # start dev server on http://localhost:3000
npm test               # run all 48 unit tests (Vitest)
npm run test:watch     # watch mode
npm run lint           # ESLint
npm run format:check   # Biome formatting check (read-only)
npm run format         # Biome formatting auto-fix
npm run build          # TypeScript + Next.js production build
```

## Pre-Commit Hook

Husky runs `npm run precommit` before each commit. The script runs:

1. **`lint-staged`** — formats staged `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.json`, `.css` files with Biome.
2. **`npm run lint`** — ESLint for code quality (Next.js + TypeScript rules).
3. **`npm test`** — full Vitest unit test suite. A failing test blocks the commit.

## Commit Message Format

All commits must follow **Conventional Commits**:

```
<type>(<scope>): <description>
```

Valid types: `feat` `fix` `docs` `style` `refactor` `test` `chore` `ci` `perf` `build` `revert`

Examples:
```
feat(llm): add Langfuse tracing via observeOpenAI
fix(table): correct assetId key mapping in rationale lookup
chore: update dependencies to latest minor versions
```

The `commit-msg` Husky hook enforces this format on every commit.  
Merge commits, revert commits, and fixup commits are automatically allowed through.

## Branch Naming Convention

All branches must follow the pattern `<type>/<description>` (lowercase, hyphens):

| Allowed | Examples |
|---|---|
| `main`, `develop`, `staging` | — |
| `feat/<name>` | `feat/add-rollbar-integration` |
| `fix/<name>` | `fix/missing-rationale-keys` |
| `hotfix/<name>` | `hotfix/api-key-rotation` |
| `chore/<name>` | `chore/update-dependencies` |
| `docs/<name>` | `docs/update-architecture` |
| `release/<semver>` | `release/1.2.0` |

The `pre-push` Husky hook validates the branch name before every push.

## Changelog

All notable changes are recorded in `CHANGELOG.md` at the project root, following the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format.

**When to update it:**
- Every PR that touches user-facing behaviour, a new feature, or a bug fix must update `CHANGELOG.md`.
- Internal refactors and tooling changes (`chore`, `ci`, `style`) may skip it.

**Enforcement:**  
The GitHub Actions CI workflow (`.github/workflows/ci.yml`) fails on PRs to `main` or `develop` if `CHANGELOG.md` was not modified. PRs can bypass this check with the `skip-changelog` label (intended for lockfile-only or CI-config-only changes).

## CI / CD

Every push and pull request to `main`, `develop`, or `staging` runs the full CI pipeline via `.github/workflows/ci.yml`:

1. `npm run format:check`
2. `npm run lint`
3. `npm test`
4. `npm run build`
5. On PRs to `main`/`develop`: changelog presence check

Vercel deploys automatically on every push to `main`. See `docs/architecture.md` and the deploy subagent (`.cursor/subagents/pre-release-checker.md`) for the pre-release checklist.

## Commit Strategy

For the final submission, clean commits replay the development arc:

1. Wire actual data (`data/actual/*.json`) and normalise to internal types
2. Portfolio calculations and unit tests
3. Dashboard UI with brand styling
4. LLM rationale generation (GPT + Instructor + Zod)
5. Observability (Langfuse tracing, Rollbar error tracking)
6. Tooling (Biome, Husky hooks, GitHub Actions CI)
7. Documentation and AI workflow configuration
