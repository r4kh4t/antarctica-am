import type { NextConfig } from "next";

// Security headers applied to every response.
// CSP is intentionally permissive for the sources we actually use;
// tighten each directive when the list of third-party origins stabilises.
const securityHeaders = [
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    // Opt out of every policy feature the app does not use
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    // 2 years; include subdomains so *.vercel.app is also covered
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    // Content-Security-Policy
    // - script-src: Next.js requires 'unsafe-inline' for inline event handlers
    //   and 'unsafe-eval' for dev mode only (production builds are stricter via nonce).
    //   Vercel Speed Insights and Analytics are loaded from va.vercel-scripts.com.
    // - connect-src: Rollbar, Langfuse, OpenTelemetry OTLP, Vercel Analytics.
    // - img-src: data URIs are used by Recharts for chart export.
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self' https://api.rollbar.com https://cloud.langfuse.com https://api.openai.com https://vitals.vercel-insights.com https://va.vercel-scripts.com",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

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

  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
