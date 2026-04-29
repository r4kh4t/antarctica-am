/**
 * Integration tests for POST /api/rationale
 *
 * The route is tested by calling the handler function directly with a synthetic
 * NextRequest. All external dependencies (OpenAI / Instructor, Langfuse, Rollbar,
 * Next.js `after`) are mocked so no real API calls are made.
 *
 * Scenarios covered:
 *  1. Valid payload  → 200 with correct response shape
 *  2. Invalid payload → 400 (ValidationError; Rollbar NOT called)
 *  3. OpenAI failure  → 500 with error message + captureServerError called
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ── Mocks (must be declared before the import under test) ──────────────────────

vi.mock("next/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/server")>();
  return {
    ...actual,
    // Execute the after() callback synchronously so tests don't need to await it.
    after: vi.fn((fn: () => unknown) => fn()),
  };
});

vi.mock("@/instrumentation", () => ({
  langfuseSpanProcessor: { forceFlush: vi.fn().mockResolvedValue(undefined) },
}));

const mockCaptureServerError = vi.fn().mockResolvedValue(undefined);
vi.mock("@/lib/rollbar", () => ({
  captureServerError: mockCaptureServerError,
}));

const mockInstructorCreate = vi.fn();
vi.mock("@/lib/llm/instructor", () => ({
  getInstructorClient: () => ({
    chat: { completions: { create: mockInstructorCreate } },
  }),
}));

// ── Fixtures ───────────────────────────────────────────────────────────────────

const validRow = (assetId: string, current: number, recommended: number) => ({
  assetId,
  ticker: assetId,
  name: `${assetId} Fund`,
  sector: "Global Equity",
  region: "Global",
  currentWeight: current,
  recommendedWeight: recommended,
  weightDelta: recommended - current,
  averageMonthlyReturn: 0.01,
  annualizedVolatility: 0.1,
  riskAdjustedScore: 0.5,
  rationale: "Hold: returns ahead of benchmark.",
});

const validBody = {
  rows: [validRow("AAM-X", 0.5, 0.6), validRow("AAM-Y", 0.5, 0.4)],
  sectorExposures: [],
  summary: {
    expectedMonthlyReturn: 0.01,
    currentExpectedMonthlyReturn: 0.009,
    expectedAnnualizedVolatility: 0.09,
    turnover: 0.1,
    benchmarkAverageMonthlyReturn: 0.008,
  },
  benchmarkName: "Test Benchmark",
  asOf: "2025-09-30",
};

const validLLMResponse = {
  narrative: "Portfolio rebalancing tilts toward stronger risk-adjusted assets this quarter.",
  rationale: {
    "AAM-X": "Increase in AAM-X reflects strong risk-adjusted score vs benchmark.",
    "AAM-Y": "Reduction in AAM-Y follows weaker monthly returns and higher volatility.",
  },
  sectorInsights: {
    "Global Equity": "Global Equity allocation sits near mid-range of its target band.",
  },
};

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/rationale", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe("POST /api/rationale", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: standard (non-reasoning) model path via Instructor
    process.env.OPENAI_MODEL = "gpt-4o";
    process.env.OPENAI_API_KEY = "test-key";
    mockInstructorCreate.mockResolvedValue(validLLMResponse);
  });

  it("returns 200 with narrative, rationale, and sectorInsights for a valid payload", async () => {
    const { POST } = await import("./route");
    const res = await POST(makeRequest(validBody));

    expect(res.status).toBe(200);
    const json = await res.json();

    expect(json).toMatchObject({
      narrative: expect.stringContaining("rebalanc"),
      rationale: {
        "AAM-X": expect.any(String),
        "AAM-Y": expect.any(String),
      },
      model: "gpt-4o",
      promptVersion: expect.any(String),
    });

    // Rollbar must NOT be called on a successful request
    expect(mockCaptureServerError).not.toHaveBeenCalled();
  });

  it("returns 400 when the payload fails validation (guardrail rejection)", async () => {
    const { POST } = await import("./route");

    const badBody = { ...validBody, rows: [] }; // empty rows → ValidationError
    const res = await POST(makeRequest(badBody));

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toHaveProperty("error");
    expect(json.error).toMatch(/non-empty/);

    // Validation errors must NOT trigger Rollbar — they are caller mistakes
    expect(mockCaptureServerError).not.toHaveBeenCalled();
  });

  it("returns 500 and calls captureServerError when the OpenAI call fails", async () => {
    mockInstructorCreate.mockRejectedValue(new Error("OpenAI upstream timeout"));

    const { POST } = await import("./route");
    const res = await POST(makeRequest(validBody));

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toMatch(/timeout/);

    // Upstream failures must be reported to Rollbar
    expect(mockCaptureServerError).toHaveBeenCalledOnce();
    expect(mockCaptureServerError).toHaveBeenCalledWith(expect.any(Error));
  });
});
