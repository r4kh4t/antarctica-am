import { describe, expect, it } from "vitest";
import { RationaleResponseSchema } from "./schemas";

/**
 * Tests the Zod schema that constrains what the LLM is allowed to return.
 * These tests simulate valid and invalid LLM responses to verify that
 * Instructor's retry logic would trigger in the right circumstances.
 */

const VALID_RESPONSE = {
  narrative: "The rebalancing tilts the portfolio toward higher-scoring equity funds.",
  rationale: {
    "AAM-LGQ": "Strong risk-adjusted score justifies the increase.",
    "AAM-IGC": "Reduced due to lower momentum and below-benchmark returns.",
  },
  sectorInsights: {
    "Global Equity": "Equity exposure sits at the upper end of the target band.",
  },
};

describe("RationaleResponseSchema", () => {
  it("parses a fully valid response", () => {
    const result = RationaleResponseSchema.safeParse(VALID_RESPONSE);
    expect(result.success).toBe(true);
  });

  it("rejects a response with a too-short narrative", () => {
    const bad = { ...VALID_RESPONSE, narrative: "OK." };
    const result = RationaleResponseSchema.safeParse(bad);
    expect(result.success).toBe(false);
  });

  it("rejects a response with a missing rationale field", () => {
    const { rationale: _, ...noRationale } = VALID_RESPONSE;
    const result = RationaleResponseSchema.safeParse(noRationale);
    expect(result.success).toBe(false);
  });

  it("rejects a response where a rationale value is too short", () => {
    const bad = {
      ...VALID_RESPONSE,
      rationale: { "AAM-LGQ": "OK" }, // under 10 chars
    };
    const result = RationaleResponseSchema.safeParse(bad);
    expect(result.success).toBe(false);
  });

  it("accepts a response without sectorInsights (optional field)", () => {
    const { sectorInsights: _, ...noSectors } = VALID_RESPONSE;
    const result = RationaleResponseSchema.safeParse(noSectors);
    expect(result.success).toBe(true);
  });

  it("defaults sectorInsights to an empty object when omitted", () => {
    const { sectorInsights: _, ...noSectors } = VALID_RESPONSE;
    const result = RationaleResponseSchema.parse(noSectors);
    expect(result.sectorInsights).toEqual({});
  });

  it("rejects non-string values inside rationale", () => {
    const bad = {
      ...VALID_RESPONSE,
      rationale: { "AAM-LGQ": 42 },
    };
    const result = RationaleResponseSchema.safeParse(bad);
    expect(result.success).toBe(false);
  });

  it("rejects a response where rationale is not an object", () => {
    const bad = { ...VALID_RESPONSE, rationale: "just a string" };
    const result = RationaleResponseSchema.safeParse(bad);
    expect(result.success).toBe(false);
  });

  it("infers the correct TypeScript type", () => {
    const result = RationaleResponseSchema.parse(VALID_RESPONSE);
    // These property accesses confirm the inferred shape at compile time
    const narrative: string = result.narrative;
    const rationale: Record<string, string> = result.rationale;
    const sectorInsights: Record<string, string> = result.sectorInsights;
    expect(narrative).toBeTruthy();
    expect(rationale).toBeDefined();
    expect(sectorInsights).toBeDefined();
  });
});
