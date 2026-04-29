/**
 * Next.js instrumentation hook — runs once at server startup.
 *
 * Registers the Langfuse OpenTelemetry span processor so every traced LLM call
 * is automatically sent to Langfuse. The processor is exported so API routes
 * can call forceFlush() before a serverless function terminates.
 *
 * Docs: https://langfuse.com/docs/observability/sdk/typescript
 */

import { LangfuseSpanProcessor } from "@langfuse/otel";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";

// Exported so API routes can flush before the function exits (serverless safety)
export const langfuseSpanProcessor = new LangfuseSpanProcessor();

export function register() {
  // Only run in the Node.js runtime — skip Edge and browser environments
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const provider = new NodeTracerProvider({
      spanProcessors: [langfuseSpanProcessor],
    });
    provider.register();
  }
}
