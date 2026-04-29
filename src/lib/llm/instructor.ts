import Instructor from "@instructor-ai/instructor";
import { getTracedOpenAIClient } from "./observability";

type InstructorClient = ReturnType<typeof Instructor>;

let _client: InstructorClient | null = null;

/**
 * Returns a singleton Instructor-wrapped OpenAI client.
 *
 * Instructor adds:
 * - Automatic Zod schema validation of LLM responses
 * - Automatic retry with corrective feedback when validation fails
 * - Full compatibility with the standard openai package
 *
 * The underlying OpenAI client is already instrumented with Langfuse via
 * getTracedOpenAIClient(), so all completions are automatically traced.
 *
 * Mode "JSON" uses OpenAI's response_format: json_object, which is supported by
 * GPT-4o and most recent models. For o-series reasoning models that don't support
 * JSON mode, fall back to the base OpenAI client (see route.ts).
 */
export function getInstructorClient(): InstructorClient {
  if (!_client) {
    _client = Instructor({
      client: getTracedOpenAIClient(),
      mode: "JSON",
    });
  }

  return _client;
}
