/**
 * Unit tests for the in-process rationale cache.
 *
 * Covers:
 *  1. Cache miss returns null
 *  2. Cache hit returns the stored value
 *  3. Expired entries are evicted and return null
 *  4. buildRationaleCacheKey is deterministic and key-order-insensitive
 *  5. Route-level cache hit: identical payload skips the Instructor call
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  buildRationaleCacheKey,
  getCachedRationale,
  setCachedRationale,
  clearRationaleCache,
} from "./cache";

describe("buildRationaleCacheKey", () => {
  it("returns the same hash for equivalent objects regardless of key order", () => {
    const a = { z: 1, a: 2 };
    const b = { a: 2, z: 1 };
    expect(buildRationaleCacheKey(a)).toBe(buildRationaleCacheKey(b));
  });

  it("returns different hashes for different payloads", () => {
    expect(buildRationaleCacheKey({ x: 1 })).not.toBe(buildRationaleCacheKey({ x: 2 }));
  });

  it("returns a 64-character hex SHA-256 string", () => {
    const key = buildRationaleCacheKey({ foo: "bar" });
    expect(key).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("getCachedRationale / setCachedRationale", () => {
  beforeEach(() => clearRationaleCache());

  it("returns null for an unknown key", () => {
    expect(getCachedRationale("no-such-key")).toBeNull();
  });

  it("returns the stored value immediately after setting", () => {
    setCachedRationale("k1", { narrative: "hello" });
    expect(getCachedRationale("k1")).toEqual({ narrative: "hello" });
  });

  it("evicts an entry after its TTL has elapsed", () => {
    const realDateNow = Date.now;
    try {
      // Set entry when "now" is T
      Date.now = vi.fn().mockReturnValue(0);
      setCachedRationale("k2", { narrative: "stale" });

      // Move time past the 1-hour TTL
      Date.now = vi.fn().mockReturnValue(60 * 60 * 1000 + 1);
      expect(getCachedRationale("k2")).toBeNull();
    } finally {
      Date.now = realDateNow;
    }
  });
});

// ── Route integration: cache hit skips the OpenAI call ────────────────────────

vi.mock("next/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/server")>();
  return { ...actual, after: vi.fn((fn: () => unknown) => fn()) };
});

vi.mock("@/instrumentation", () => ({
  langfuseSpanProcessor: { forceFlush: vi.fn().mockResolvedValue(undefined) },
}));

vi.mock("@/lib/rollbar", () => ({
  captureServerError: vi.fn().mockResolvedValue(undefined),
}));

const mockCreate = vi.fn();
vi.mock("@/lib/llm/instructor", () => ({
  getInstructorClient: () => ({ chat: { completions: { create: mockCreate } } }),
}));

import { NextRequest } from "next/server";

describe("POST /api/rationale — cache integration", () => {
  const row = (id: string, cur: number, rec: number) => ({
    assetId: id,
    ticker: id,
    name: `${id} Fund`,
    sector: "Equity",
    region: "Global",
    currentWeight: cur,
    recommendedWeight: rec,
    weightDelta: rec - cur,
    averageMonthlyReturn: 0.01,
    annualizedVolatility: 0.1,
    riskAdjustedScore: 0.5,
    rationale: "Hold.",
  });

  const body = {
    rows: [row("AAM-A", 0.5, 0.6), row("AAM-B", 0.5, 0.4)],
    sectorExposures: [],
    summary: {
      expectedMonthlyReturn: 0.01,
      currentExpectedMonthlyReturn: 0.009,
      expectedAnnualizedVolatility: 0.09,
      turnover: 0.1,
      benchmarkAverageMonthlyReturn: 0.008,
    },
    benchmarkName: "Benchmark",
    asOf: "2025-09-30",
  };

  const llmResponse = {
    narrative: "Rebalancing improves the portfolio risk-return profile this quarter.",
    rationale: {
      "AAM-A": "AAM-A increase reflects superior risk-adjusted score vs peers.",
      "AAM-B": "AAM-B reduction follows weaker recent performance and higher vol.",
    },
    sectorInsights: {},
  };

  function makeReq(b: unknown) {
    return new NextRequest("http://localhost/api/rationale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(b),
    });
  }

  beforeEach(() => {
    vi.clearAllMocks();
    clearRationaleCache();
    process.env.OPENAI_MODEL = "gpt-4o";
    process.env.OPENAI_API_KEY = "test-key";
    mockCreate.mockResolvedValue(llmResponse);
  });

  afterEach(() => clearRationaleCache());

  it("calls OpenAI exactly once on cache miss, then serves from cache on second call", async () => {
    const { POST } = await import("../../app/api/rationale/route");

    // First call — cache miss
    const res1 = await POST(makeReq(body));
    expect(res1.status).toBe(200);
    const json1 = await res1.json();
    expect(json1.cached).toBeUndefined(); // not marked as cached

    // Second call — same payload → cache hit
    const res2 = await POST(makeReq(body));
    expect(res2.status).toBe(200);
    const json2 = await res2.json();
    expect(json2.cached).toBe(true);

    // OpenAI was only called once
    expect(mockCreate).toHaveBeenCalledOnce();
  });
});
