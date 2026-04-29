import { describe, expect, it } from "vitest";
import { estimateTokens, assertFitsContext, getContextLimit, MODEL_LIMITS } from "./tokens";

describe("estimateTokens", () => {
  it("returns 0 for an empty string", () => {
    expect(estimateTokens("")).toBe(0);
  });

  it("returns a positive count for non-empty text", () => {
    expect(estimateTokens("hello world")).toBeGreaterThan(0);
  });

  it("scales with string length", () => {
    const short = estimateTokens("abc");
    const long = estimateTokens("abc".repeat(100));
    expect(long).toBeGreaterThan(short);
  });

  it("approximates ~4 characters per token", () => {
    // 400 chars ÷ 4 = 100 tokens
    const text = "a".repeat(400);
    expect(estimateTokens(text)).toBe(100);
  });
});

describe("getContextLimit", () => {
  it("returns the correct limit for known models", () => {
    expect(getContextLimit("gpt-4o")).toBe(MODEL_LIMITS["gpt-4o"]);
    expect(getContextLimit("o4-mini")).toBe(MODEL_LIMITS["o4-mini"]);
  });

  it("falls back to 128k for unknown models", () => {
    expect(getContextLimit("some-future-model")).toBe(128_000);
  });
});

describe("assertFitsContext", () => {
  it("does not throw for short prompts", () => {
    expect(() => assertFitsContext("short prompt", "gpt-4o")).not.toThrow();
  });

  it("throws when the prompt would exceed 85% of the context window", () => {
    // gpt-4o limit: 128_000 tokens. 85% = 108_800 tokens ≈ 435_200 chars
    const hugePseudoText = "a".repeat(128_000 * 4); // ~128k tokens estimate
    expect(() => assertFitsContext(hugePseudoText, "gpt-4o")).toThrow(/exceed/i);
  });
});
