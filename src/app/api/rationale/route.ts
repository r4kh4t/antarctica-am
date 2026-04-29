import { after, type NextRequest } from "next/server";
import { getModelName, isReasoningModel } from "@/lib/llm/client";
import { getInstructorClient } from "@/lib/llm/instructor";
import { getTracedOpenAIClient } from "@/lib/llm/observability";
import {
  validateRationaleRequest,
  normalizeRationaleResponse,
  ValidationError,
} from "@/lib/llm/guardrails";
import { formatForLLM } from "@/lib/llm/formatters";
import { assertFitsContext } from "@/lib/llm/tokens";
import { SYSTEM_PROMPT, PROMPT_VERSION } from "@/lib/llm/prompts/rationale";
import { RationaleResponseSchema } from "@/lib/llm/schemas";
import { langfuseSpanProcessor } from "@/instrumentation";
import { captureServerError } from "@/lib/rollbar";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateRationaleRequest(body);

    const userMessage = formatForLLM(validated);
    const model = getModelName();

    assertFitsContext(SYSTEM_PROMPT + "\n" + userMessage, model);

    const messages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      { role: "user" as const, content: userMessage },
    ];

    let result: ReturnType<typeof RationaleResponseSchema.parse>;
    let totalTokens = 0;

    if (isReasoningModel(model)) {
      // o-series models don't support JSON mode — parse + validate manually with Zod.
      // The traced client automatically sends the generation to Langfuse.
      const openai = getTracedOpenAIClient();
      const completion = await openai.chat.completions.create({ model, messages });
      const raw = completion.choices[0]?.message?.content ?? "";
      totalTokens = completion.usage?.total_tokens ?? 0;
      result = RationaleResponseSchema.parse(JSON.parse(raw));
    } else {
      // GPT-4o and other standard models: Instructor handles Zod validation + retries.
      // The Instructor client wraps the traced OpenAI client, so Langfuse captures
      // every completion including retries.
      const instructor = getInstructorClient();
      const completion = await instructor.chat.completions.create({
        model,
        messages,
        response_model: { schema: RationaleResponseSchema, name: "PortfolioRationale" },
        max_retries: 2,
      });

      result = completion;
    }

    // Flush pending Langfuse spans after the response is sent (serverless-safe).
    // `after()` runs after the response is delivered, ensuring traces are not lost
    // when the serverless function terminates.
    after(async () => {
      await langfuseSpanProcessor.forceFlush();
    });

    const safe = normalizeRationaleResponse(result!, validated.rows);

    return Response.json({
      ...safe,
      model,
      promptVersion: PROMPT_VERSION,
      tokensUsed: totalTokens,
    });
  } catch (error: unknown) {
    console.error("[POST /api/rationale]", error);
    const message = error instanceof Error ? error.message : "Unknown error";

    // Validation errors are the caller's fault — return 400 without Rollbar noise.
    if (error instanceof ValidationError) {
      return Response.json({ error: message }, { status: 400 });
    }

    // Upstream failures (OpenAI, parse errors, etc.) are 500s and worth tracking.
    await captureServerError(error);
    return Response.json({ error: message }, { status: 500 });
  }
}
