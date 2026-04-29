/**
 * Langfuse observability via the @langfuse/openai drop-in integration.
 *
 * observeOpenAI wraps an OpenAI client and automatically traces:
 *   - All prompts and completions
 *   - Token usage and estimated cost (USD)
 *   - Latency and time-to-first-token
 *   - OpenAI API errors
 *
 * The traced client is a transparent proxy — it can be passed directly to
 * Instructor or used as a regular OpenAI client without any API changes.
 *
 * If Langfuse credentials are absent the plain OpenAI client is returned,
 * so tracing is always opt-in and never breaks the application.
 *
 * Docs: https://langfuse.com/docs/integrations/openai/js/get-started
 */

import OpenAI from "openai";
import { observeOpenAI } from "@langfuse/openai";
import { PROMPT_VERSION } from "./prompts/rationale";

let _client: OpenAI | null = null;

/**
 * Returns a singleton OpenAI client instrumented with Langfuse tracing.
 * Falls back to a plain client when LANGFUSE credentials are not configured.
 */
export function getTracedOpenAIClient(): OpenAI {
  if (!_client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY environment variable is not set.");

    const openai = new OpenAI({ apiKey });

    const hasCredentials =
      Boolean(process.env.LANGFUSE_SECRET_KEY) && Boolean(process.env.LANGFUSE_PUBLIC_KEY);

    _client = hasCredentials
      ? (observeOpenAI(openai, {
          generationName: "portfolio-rationale",
          tags: ["portfolio-rationale", "antarctica-am"],
          generationMetadata: { promptVersion: PROMPT_VERSION },
        }) as OpenAI)
      : openai;
  }

  return _client;
}
