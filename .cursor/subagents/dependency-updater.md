---
name: dependency-updater
description: >
  Safely update outdated npm dependencies: identify what is stale, update
  patch/minor versions automatically, flag major bumps for manual review,
  run the test suite after each update group, and summarise the changes.
  Use when you want to keep dependencies current without breaking anything.
tools: [shell, read_file, edit_file]
---

# Dependency Updater

Keeps the project's npm dependencies current with zero breakage.

## Mission

Update dependencies incrementally — patches and minors together, each major
version separately — verifying the CI pipeline after every group.

## Steps

### 1. Audit current state

```bash
npm outdated
npm audit --json | jq '.vulnerabilities | to_entries[] | {name: .key, severity: .value.severity}'
```

### 2. Apply safe updates (patch + minor)

```bash
npx npm-check-updates --target minor --upgrade
npm install --legacy-peer-deps
```

### 3. Verify nothing broke

```bash
npm run format:check && npm run lint && npm test && npm run build
```

If any step fails: revert with `git checkout package.json package-lock.json` and
`npm install --legacy-peer-deps`, then report which package caused the failure.

### 4. List major-version bumps available

```bash
npx npm-check-updates --target latest
```

For each major bump, output:
- Package name + current → latest
- Link to the changelog (https://github.com/<org>/<repo>/releases)
- A brief note on any breaking change that is relevant to this project

Do NOT auto-apply major bumps. Summarise them for the developer to decide.

### 5. Security vulnerabilities

```bash
npm audit
```

For any `high` or `critical` severity findings, propose the fix command but
do not run it automatically — print it for developer approval.

## Output format

```
Dependency Update Summary
─────────────────────────
Updated (patch/minor):  <list of name: old → new>
CI after update:        ✓ All checks passed  (or ✗ with details)

Major bumps available:  <list or "None">

Security issues:        <list with severity or "None">

Action needed: <summary or "All clear — dependencies are current.">
```

## Constraints

- Never upgrade `eslint` above 9 (Node 20.9 incompatibility).
- Never upgrade `typescript` above 5 (current config assumes 5.x).
- Never upgrade `vitest` above 3.
- Check `package.json` `engines` field before applying any update.
