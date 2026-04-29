# AI Workflow

## Purpose

The assignment explicitly welcomes committed AI configuration. This repository includes Cursor rules, hooks, skills, and `AGENTS.md` to show that AI assistance was used with guardrails rather than treated as unchecked output.

## Included Files

- `.cursor/rules/project-engineering.mdc`: general engineering expectations.
- `.cursor/rules/next-react-boundaries.mdc`: Next.js server/client boundary guidance.
- `.cursor/rules/portfolio-domain.mdc`: portfolio calculation rules.
- `.cursor/hooks.json`: project hook configuration.
- `.cursor/hooks/guard-risky-shell.mjs`: prompts before risky shell commands.
- `.cursor/hooks/post-edit-reminder.mjs`: reminds agents to run relevant checks after key edits.
- `.cursor/skills/portfolio-recommendation/SKILL.md`: assignment workflow guidance.
- `.cursor/skills/assignment-code-review/SKILL.md`: review checklist.

## Review Standard

AI-generated code must still be checked for:

- correctness and deterministic behavior;
- weak abstractions or unnecessary complexity;
- subtle financial calculation errors;
- security or shell-safety risks;
- missing tests around business-critical behavior.
