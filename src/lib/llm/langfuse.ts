/**
 * Optional Langfuse observability wrapper.
 * Does nothing when LANGFUSE_SECRET_KEY is not set, so it is safe to call
 * unconditionally in the API route.
 */

import { Langfuse } from "langfuse";
import type { ChatCompletionMessageParam } from "openai/resources/index.js";

let _client: Langfuse | null = null;

function getClient(): Langfuse | null {
  if (_client !== null) return _client;

  if (process.env.LANGFUSE_SECRET_KEY) {
    _client = new Langfuse({
      secretKey: process.env.LANGFUSE_SECRET_KEY,
      publicKey: process.env.LANGFUSE_PUBLIC_KEY ?? "",
      baseUrl: process.env.LANGFUSE_HOST,
    });
  }

  return _client;
}

export type LangfuseGenerationMeta = {
  model: string;
  promptVersion: string;
  messages: ChatCompletionMessageParam[];
  output: string;
  tokensUsed: number;
};

export async function traceLLMCall(
  meta: LangfuseGenerationMeta,
  call: () => Promise<string>,
): Promise<string> {
  const lf = getClient();

  if (!lf) {
    return call();
  }

  const trace = lf.trace({ name: "portfolio-rationale" });
  const generation = trace.generation({
    name: "rationale",
    model: meta.model,
    input: meta.messages,
    metadata: { promptVersion: meta.promptVersion },
  });

  let result: string;

  try {
    result = await call();
    generation.end({ output: result, usage: { totalTokens: meta.tokensUsed } });
    await lf.flushAsync();
    return result;
  } catch (error) {
    generation.end({ output: "ERROR", level: "ERROR" });
    await lf.flushAsync();
    throw error;
  }
}
