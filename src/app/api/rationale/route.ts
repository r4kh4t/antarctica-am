import { type NextRequest } from "next/server";
import { getOpenAIClient, getModelName, isReasoningModel } from "@/lib/llm/client";
import { validateRationaleRequest, validateRationaleResponse } from "@/lib/llm/guardrails";
import { formatForLLM } from "@/lib/llm/formatters";
import { assertFitsContext } from "@/lib/llm/tokens";
import { traceLLMCall } from "@/lib/llm/langfuse";
import { SYSTEM_PROMPT, PROMPT_VERSION } from "@/lib/llm/prompts/rationale";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateRationaleRequest(body);

    const userMessage = formatForLLM(validated);
    const model = getModelName();

    assertFitsContext(SYSTEM_PROMPT + "\n" + userMessage, model);

    const openai = getOpenAIClient();
    const messages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      { role: "user" as const, content: userMessage },
    ];

    // Reasoning (o-series) models don't support temperature or response_format: json_object
    // on older API versions — use plain content + strict JSON instruction in the prompt instead.
    const baseParams = {
      model,
      messages,
    };

    const params = isReasoningModel(model)
      ? baseParams
      : { ...baseParams, response_format: { type: "json_object" as const }, temperature: 0.2 };

    let rawContent = "";

    await traceLLMCall(
      { model, promptVersion: PROMPT_VERSION, messages, output: "", tokensUsed: 0 },
      async () => {
        const completion = await openai.chat.completions.create(params);
        rawContent = completion.choices[0]?.message?.content ?? "";
        return rawContent;
      },
    );

    const parsed = JSON.parse(rawContent);
    const safe = validateRationaleResponse(parsed, validated.rows);

    return Response.json({
      ...safe,
      model,
      promptVersion: PROMPT_VERSION,
    });
  } catch (error: unknown) {
    console.error("[POST /api/rationale]", error);

    const message = error instanceof Error ? error.message : "Unknown error";

    return Response.json({ error: message }, { status: 500 });
  }
}
