import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

// Use cwd instead of __dirname — some Vitest / Node ESM config load paths omit __dirname.
const srcRoot = resolve(process.cwd(), "src");

export default defineConfig({
  resolve: {
    alias: {
      "@": srcRoot,
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
