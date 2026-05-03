"use client";

/**
 * Client-side provider tree.
 *
 * RollbarProvider must be a client component because it sets up the browser
 * Rollbar SDK and React context. The root layout is a server component, so
 * all client-only providers are centralised here. Vercel Web Analytics and
 * Speed Insights are mounted here as well.
 */

import { Provider as RollbarProvider } from "@rollbar/react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { clientConfig } from "@/lib/rollbar";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <RollbarProvider config={clientConfig}>
      {children}
      <Analytics />
      <SpeedInsights />
    </RollbarProvider>
  );
}
