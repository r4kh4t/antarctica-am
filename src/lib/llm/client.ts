export function getModelName(): string {
  return process.env.OPENAI_MODEL ?? "gpt-4o";
}

/** o-series reasoning models have different parameter constraints. */
export function isReasoningModel(model: string): boolean {
  return /^o\d/.test(model);
}
