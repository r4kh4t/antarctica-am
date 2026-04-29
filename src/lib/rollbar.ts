/**
 * Rollbar error tracking configuration.
 *
 * Two separate concerns:
 *   clientConfig  — a plain object passed to <RollbarProvider> in the browser.
 *                   Uses NEXT_PUBLIC_ so it is available on the client.
 *   captureServerError — async helper for API routes; lazily imports the
 *                   Node.js Rollbar SDK so it is never bundled for the browser.
 *
 * When neither ROLLBAR env var is set the helpers are no-ops so the app
 * works normally without Rollbar configured.
 *
 * To enable:
 *   1. Install from Vercel Marketplace → Observability → Rollbar  (auto-sets tokens)
 *   2. Or sign up at rollbar.com, create a project, and copy the two tokens into
 *      your .env.local (see .env.example).
 *
 * Docs: https://docs.rollbar.com/docs/nextjs
 */

export const clientConfig = {
  accessToken: process.env.NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN,
  captureUncaught: true,
  captureUnhandledRejections: true,
  environment: process.env.NODE_ENV ?? "development",
  // Rollbar is effectively a no-op when the token is absent
  enabled: Boolean(process.env.NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN),
};

/**
 * Reports an error to Rollbar from a server-side context (API route, etc.).
 * Silently does nothing when ROLLBAR_SERVER_TOKEN is not set.
 */
export async function captureServerError(error: unknown): Promise<void> {
  if (!process.env.ROLLBAR_SERVER_TOKEN) return;

  // Dynamic import keeps the `rollbar` Node.js SDK out of browser bundles
  const { default: Rollbar } = await import("rollbar");
  const rb = new Rollbar({
    accessToken: process.env.ROLLBAR_SERVER_TOKEN,
    captureUncaught: true,
    captureUnhandledRejections: true,
    environment: process.env.NODE_ENV ?? "development",
  });

  rb.error(error instanceof Error ? error : new Error(String(error)));
}
