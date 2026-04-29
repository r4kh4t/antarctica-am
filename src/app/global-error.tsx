"use client";

/**
 * Global error boundary for the root layout and template.
 *
 * Next.js renders this component when an unhandled error propagates all the
 * way to the root layout (e.g. a crash in layout.tsx itself). Because the
 * RollbarProvider from layout.tsx is unavailable at this level, we
 * instantiate Rollbar directly using the client config.
 *
 * Docs: https://nextjs.org/docs/app/api-reference/file-conventions/error#global-errorjs
 */

import { useEffect } from "react";
import Rollbar from "rollbar";
import { clientConfig } from "@/lib/rollbar";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (clientConfig.enabled) {
      const rollbar = new Rollbar(clientConfig);
      rollbar.error(error);
    }
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          fontFamily: "sans-serif",
          gap: "1rem",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Something went wrong</h2>
        <p style={{ color: "#666", maxWidth: "32rem" }}>
          An unexpected error occurred. The error has been reported automatically.
        </p>
        <button
          onClick={reset}
          style={{
            padding: "0.5rem 1.25rem",
            borderRadius: "0.375rem",
            border: "1px solid #d1d5db",
            cursor: "pointer",
            background: "#fff",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
