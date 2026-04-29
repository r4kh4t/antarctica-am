# Changelog Updater

## Mission

Inspect recent commits that are not yet reflected in `CHANGELOG.md` and write
accurate, concise entries under `## [Unreleased]`.

Invoke this subagent when:
- Several commits landed without changelog updates
- You want to audit CHANGELOG.md before a release
- Preparing to cut a new version section (promote `[Unreleased]` to a version)

---

## Steps

### 1. Check what is already documented

Read `CHANGELOG.md`, focusing on the `## [Unreleased]` section.
Note which features/fixes are already covered.

### 2. Identify undocumented commits

```bash
# All commits not yet on origin/main (pushed but uncaptured)
git log --oneline --no-merges origin/main..HEAD

# Last 20 commits (for local audit)
git log --oneline --no-merges -20
```

For each commit, check whether its change is already recorded in
`## [Unreleased]`. Focus on `feat`, `fix`, `refactor`, `perf`, `build`, and
`ci` type commits. Skip `style`, `chore: format`, and docs-only commits.

### 3. Classify each undocumented change

| Commit type | Changelog heading |
|---|---|
| `feat` | Added |
| `fix` | Fixed |
| `refactor` | Changed |
| `perf` | Changed |
| `build` / `ci` | Changed (if it affects developer workflow) |
| `docs` | skip (unless it adds a new doc page users would notice) |
| `style` | skip |

### 4. Write entries

Add entries under the correct heading in `## [Unreleased]`.
Format: one line per change, starting with a backtick label if helpful.

```markdown
### Added
- `src/lib/constants.ts`: centralise AI_STATUS, AiState, and API_ROUTES

### Changed
- `globals.css`: migrate brand tokens to Tailwind v4 @theme semantic names
```

### 5. Clean up and commit

```bash
npm run format        # Biome may reformat CHANGELOG.md
git add CHANGELOG.md
git commit -m "docs: update CHANGELOG for recent changes"
```

---

## Promoting [Unreleased] to a Version (Release)

When cutting a release, replace `## [Unreleased]` with a versioned heading and
add a fresh empty `## [Unreleased]` above it:

```markdown
## [Unreleased]

## [1.1.0] — 2026-04-30

### Added
...
```

Then tag the commit:

```bash
git tag -a v1.1.0 -m "Release 1.1.0"
git push origin v1.1.0
```
