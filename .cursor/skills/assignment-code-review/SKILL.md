---
name: assignment-code-review
description: Review the take-home assignment for correctness, maintainability, Next.js conventions, testing, accessibility, and AI-output risks. Use when reviewing code changes before commits or submission.
---

# Assignment Code Review

## Review Checklist

- Check portfolio math for deterministic behavior, correct weight totals, and clear constraint handling.
- Check UI for stakeholder clarity, responsive layout, readable numbers, and accessible labels.
- Check Next.js boundaries: server calculations stay server-side; chart-only code is client-side.
- Check tests cover business-critical behavior rather than only implementation details.
- Check README explains setup, assumptions, methodology, AI usage, and deployment.
- Check AI-generated code for weak abstractions, subtle logic errors, unsafe shell commands, and stale comments.

## Feedback Format

Lead with blocking issues first. Include file references, explain the user or business impact, and suggest the smallest practical fix.
