/**
 * Simple token estimation utilities.
 *
 * A precise count requires the tiktoken WASM package, which is heavy. This
 * file provides a good-enough approximation (≈ 4 chars per token for English
 * text) that is useful for budget checks before sending requests.
 */

const CHARS_PER_TOKEN = 4;

/** Rough estimate of the number of tokens in a string. */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/** Model context window sizes (input tokens). */
export const MODEL_LIMITS: Record<string, number> = {
  "gpt-4o": 128_000,
  "gpt-4o-mini": 128_000,
  o1: 200_000,
  "o3-mini": 200_000,
  "o4-mini": 200_000,
};

/** Returns the context limit for a model, defaulting to 128k. */
export function getContextLimit(model: string): number {
  return MODEL_LIMITS[model] ?? 128_000;
}

/** Throws if a prompt would clearly exceed the model's context. */
export function assertFitsContext(text: string, model: string): void {
  const estimated = estimateTokens(text);
  const limit = getContextLimit(model);

  if (estimated > limit * 0.85) {
    throw new Error(
      `Prompt estimate (${estimated} tokens) would exceed 85% of the ${model} context limit (${limit}).`,
    );
  }
}
