import { z } from "zod";

/**
 * Zod schema for the portfolio rationale LLM response.
 *
 * Used with Instructor JS to:
 *  - Enforce a strict response shape instead of relying on manual JSON parsing
 *  - Automatically retry when the LLM returns invalid or malformed output
 *  - Generate typed responses that flow through the codebase without casts
 *
 * Bump PROMPT_VERSION in prompts/rationale.ts when the schema changes.
 */
export const RationaleResponseSchema = z.object({
  narrative: z
    .string()
    .min(20)
    .describe("2–4 sentence overall portfolio assessment suitable for a stakeholder debrief"),

  rationale: z
    .record(z.string(), z.string().min(10))
    .describe(
      "Per-asset commentary keyed by the exact Asset ID from the `Asset ID` column (e.g. 'AAM-LGQ'). " +
        "Each value must be 2–3 professional sentences.",
    ),

  sectorInsights: z
    .record(z.string(), z.string().min(10))
    .optional()
    .default({})
    .describe(
      "One-sentence sector positioning comment keyed by sector name. " +
        "Mention whether the weight sits near the floor, ceiling, or mid-range of its target band.",
    ),
});

export type RationaleResponseShape = z.infer<typeof RationaleResponseSchema>;
