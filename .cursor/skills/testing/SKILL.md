---
name: testing
description: Write, run, and maintain tests for the Antarctica portfolio app. Use when adding unit tests, debugging failing tests, deciding what to test, or improving test coverage for the LLM utilities and portfolio logic.
---

# Testing

Guides test writing and maintenance for the Antarctica Portfolio Recommendation app.

## Testing Stack

- **Framework**: Vitest 3 (`npm test` or `npm run test:watch`)
- **Location**: co-located test files, e.g. `tokens.ts` → `tokens.test.ts`
- **Coverage**: `src/lib/portfolio/` (recommendation logic) and `src/lib/llm/` (LLM utilities)

## What to Test

Focus on **pure functions with business-critical logic**. Tests should verify behaviour, not implementation.

### High-value targets

| Module | Key functions to cover |
|---|---|
| `src/lib/portfolio/recommendation.ts` | Weight scoring, constraint enforcement, total weight = 1 |
| `src/lib/llm/guardrails.ts` | Input validation rejects bad data; output normalisation fills gaps |
| `src/lib/llm/formatters.ts` | Asset ID column present; markdown table structure; percentage formatting |
| `src/lib/llm/tokens.ts` | Token estimation; context limit lookup; assertFitsContext throws on overflow |
| `src/lib/llm/schemas.ts` | Zod schema accepts valid shapes; rejects missing fields; enforces min lengths |

### Low-value targets (skip unless logic grows)

- React components — no business logic; snapshot tests would be brittle
- `client.ts`, `instructor.ts`, `observability.ts` — thin SDK wrappers; testing them tests third-party libraries
- API route handler — integration-level; mock cost outweighs benefit at current scope

## Test Patterns

```typescript
// Describe blocks map to the function or module under test
describe("validateRationaleRequest", () => {
  it("rejects an empty rows array", () => { ... });
  it("rejects weights outside [0, 1]", () => { ... });
  it("accepts a valid request", () => { ... });
});
```

Rules:
- One `describe` per function or logical unit
- Test names start with a verb: `"rejects..."`, `"returns..."`, `"throws..."`, `"accepts..."`
- Keep each test to one assertion when possible — it makes failures obvious
- Use `expect(...).toThrow()` for error paths; don't rely on try/catch

## LLM Test Patterns

LLM tests validate data contracts, not model outputs. Never call OpenAI in tests.

```typescript
// Schema validation: test valid and invalid shapes
it("rejects a narrative shorter than 20 chars", () => {
  expect(() =>
    RationaleResponseSchema.parse({ narrative: "short", rationale: {} })
  ).toThrow();
});

// Formatter: test the structure of the markdown output
it("includes an Asset ID column in the rebalancing table", () => {
  const result = formatForLLM(mockRequest);
  expect(result).toContain("| Asset ID |");
});

// Guardrails: test normalisation fills missing assets
it("fills empty string for missing asset rationale", () => {
  const result = normalizeRationaleResponse(partialResponse, rows);
  expect(result.rationale["AAM-MISSING"]).toBe("");
});
```

## Running Tests

```bash
# Run all tests once (used in pre-commit and CI)
npm test

# Watch mode during development
npm run test:watch

# Run a single test file
npx vitest run src/lib/llm/tokens.test.ts

# Run tests matching a pattern
npx vitest run --reporter verbose -t "assertFitsContext"
```

## Adding a New Test File

1. Create `<module>.test.ts` next to `<module>.ts`.
2. Import only the pure functions you want to test — no framework imports.
3. Add at least three cases: happy path, edge case, error path.
4. Run `npm test` before committing — the pre-commit hook will catch failures anyway.

## CI Integration

Tests run automatically in:
- **Pre-commit hook** (`.husky/pre-commit`): `npm run precommit` → `npm test`
- **GitHub Actions** (`.github/workflows/ci.yml`): `npm test` step
