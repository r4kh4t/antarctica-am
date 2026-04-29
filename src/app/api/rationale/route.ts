import { type NextRequest } from "next/server";
import { getOpenAIClient, getModelName, isReasoningModel } from "@/lib/llm/client";
import { getInstructorClient } from "@/lib/llm/instructor";
import { validateRationaleRequest, normalizeRationaleResponse } from "@/lib/llm/guardrails";
import { formatForLLM } from "@/lib/llm/formatters";
import { assertFitsContext } from "@/lib/llm/tokens";
import { traceLLMCall } from "@/lib/llm/langfuse";
import { SYSTEM_PROMPT, PROMPT_VERSION } from "@/lib/llm/prompts/rationale";
import { RationaleResponseSchema } from "@/lib/llm/schemas";

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

    await traceLLMCall(
      { model, promptVersion: PROMPT_VERSION, messages, output: "", tokensUsed: 0 },
      async () => {
        if (isReasoningModel(model)) {
          // o-series models don't support JSON mode — parse + validate manually with Zod
          const openai = getOpenAIClient();
          const completion = await openai.chat.completions.create({ model, messages });
          const raw = completion.choices[0]?.message?.content ?? "";
          totalTokens = completion.usage?.total_tokens ?? 0;
          result = RationaleResponseSchema.parse(JSON.parse(raw));
          return raw;
        }

        // GPT-4o and other standard models: use Instructor for automatic retry on bad output
        const instructor = getInstructorClient();
        const completion = await instructor.chat.completions.create({
          model,
          messages,
          response_model: { schema: RationaleResponseSchema, name: "PortfolioRationale" },
          max_retries: 2,
        });

        result = completion;
        // Instructor merges usage into the response — total_tokens not always exposed
        return JSON.stringify(result);
      },
    );

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
    return Response.json({ error: message }, { status: 500 });
  }
}
