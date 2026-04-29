import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Mark OpenTelemetry and Langfuse packages as server-only so Turbopack
  // does not attempt to bundle them into the browser or Edge bundles.
  serverExternalPackages: [
    "@langfuse/otel",
    "@langfuse/openai",
    "@opentelemetry/sdk-trace-node",
    "@opentelemetry/exporter-trace-otlp-http",
    "@opentelemetry/core",
    "@opentelemetry/api",
    // rollbar is used server-side via dynamic import in captureServerError()
    "rollbar",
  ],
};

export default nextConfig;
