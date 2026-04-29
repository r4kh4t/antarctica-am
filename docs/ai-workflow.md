# AI Workflow

## Purpose

The assignment explicitly welcomes committed AI configuration. This repository includes Cursor rules, hooks, skills, subagents, and `AGENTS.md` to show that AI assistance was used with guardrails rather than as unchecked output.

## Included Files

### Rules (`.cursor/rules/`)

| File | Purpose |
|---|---|
| `project-engineering.mdc` | General engineering expectations: simplicity, testability, reviewability |
| `next-react-boundaries.mdc` | Next.js server/client boundary rules — keep calculations server-side |
| `portfolio-domain.mdc` | Portfolio calculation conventions: month-end series, risk-adjusted scoring |
| `llm-integration.mdc` | LLM architecture rules: prompt versioning, guardrails, token budget, Langfuse, Instructor/Zod |

### Hooks (`.cursor/hooks/`)

| File | Purpose |
|---|---|
| `hooks.json` | Declares `beforeShellExecution` and `afterFileEdit` hooks |
| `guard-risky-shell.mjs` | Prompts before destructive or irreversible shell commands |
| `post-edit-reminder.mjs` | Reminds agents to run `npm run lint` / `npm test` after key file edits |

### Skills (`.cursor/skills/`)

Skills are **reference guides** the AI reads before starting work on a specific area:

| Skill | When to use |
|---|---|
| `portfolio-recommendation/` | Working on monthly return logic, constraints, or fixture data |
| `assignment-code-review/` | Pre-commit or pre-submission code review |
| `deploy/` | Vercel deployments, env var rotation, rollbacks |
| `testing/` | Writing new tests, debugging failing tests, coverage decisions |
| `debug/` | Diagnosing AI rationale failures, build errors, API issues |
| `langfuse/` | Langfuse tracing setup, CLI access, documentation lookups |

### Subagents (`.cursor/subagents/`)

Subagents are **autonomous agents** that run a multi-step workflow end-to-end:

| Subagent | Mission |
|---|---|
| `ci-runner.md` | Runs format → lint → test → build, collects all failures, auto-fixes formatting |
| `dependency-updater.md` | Updates patch/minor deps safely, flags major bumps for review |
| `pre-release-checker.md` | Go/no-go checklist before merging to `main` or submitting |
| `test-writer.md` | Reads a source file, writes covering tests, verifies they pass |

## Review Standard

AI-generated code is treated as a draft. Every output was checked for:

- Correctness and deterministic behavior
- Weak abstractions or unnecessary complexity
- Subtle financial calculation errors
- Security risks (no secrets in source, env vars via Vercel dashboard)
- Missing tests around business-critical logic
- Shell command safety (guarded by `guard-risky-shell.mjs`)

## LLM Features in the App

The application itself uses LLMs to generate portfolio rationale:

- **Model**: GPT-4o (configurable to `o4-mini` via `OPENAI_MODEL`)
- **Structured output**: Instructor JS + Zod (`@instructor-ai/instructor`, `zod`)
- **Observability**: Langfuse tracing via `@langfuse/openai` (`observeOpenAI` wrapper)
- **Error tracking**: Rollbar for both client and server errors
- **Prompt versioning**: `PROMPT_VERSION` constant in `src/lib/llm/prompts/rationale.ts`
- **Guardrails**: `validateRationaleRequest` + `normalizeRationaleResponse` in `guardrails.ts`
- **Token budget**: `assertFitsContext()` prevents silent prompt overruns
