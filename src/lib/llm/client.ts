import OpenAI from "openai";

let client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set.");
    }

    client = new OpenAI({ apiKey });
  }

  return client;
}

export function getModelName(): string {
  return process.env.OPENAI_MODEL ?? "gpt-4o";
}

/** o-series reasoning models have different parameter constraints. */
export function isReasoningModel(model: string): boolean {
  return /^o\d/.test(model);
}
