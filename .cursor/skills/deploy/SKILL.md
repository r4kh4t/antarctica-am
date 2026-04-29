---
name: deploy
description: Deploy the Antarctica portfolio app to Vercel, manage environment variables, and handle production issues. Use when deploying to Vercel, rotating API keys, updating env vars, rolling back a deployment, or checking deployment status.
---

# Deploy

Manages production deployments for the Antarctica Portfolio Recommendation app on Vercel.

## Project Setup

- **Vercel team scope**: `own-x-startup`
- **Project name**: `antarctica-am-draft`
- **Live URL**: https://antarctica-am-draft.vercel.app
- **GitHub repo**: connected to the private repo; every push to `main` triggers a deployment

## Deployment Commands

```bash
# Deploy to production (from the project root)
npx vercel --prod --scope own-x-startup

# Deploy a preview (any branch)
npx vercel --scope own-x-startup

# Check deployment status
npx vercel ls --scope own-x-startup

# Rollback: re-promote a previous deployment
npx vercel rollback --scope own-x-startup
```

## Environment Variables

All secrets live in Vercel's encrypted env store — never in source code or `.env.local` for prod.

| Variable | Where to set | Notes |
|---|---|---|
| `OPENAI_API_KEY` | Vercel dashboard → Settings → Environment Variables | Rotate if leaked |
| `OPENAI_MODEL` | Vercel dashboard | Default `gpt-4o`; set `o4-mini` for reasoning |
| `LANGFUSE_SECRET_KEY` | Vercel dashboard | Optional; leave blank to disable tracing |
| `LANGFUSE_PUBLIC_KEY` | Vercel dashboard | Optional |
| `LANGFUSE_HOST` | Vercel dashboard | `https://cloud.langfuse.com` (EU) or `https://us.cloud.langfuse.com` |

```bash
# Add/update an environment variable via CLI
npx vercel env add OPENAI_API_KEY --scope own-x-startup

# List all environment variables
npx vercel env ls --scope own-x-startup

# Pull remote env vars to .env.local (for local development)
npx vercel env pull --scope own-x-startup
```

## Pre-Deployment Checklist

Run these locally before pushing to `main`:

```bash
npm run format:check   # Biome formatting
npm run lint           # ESLint
npm test               # Vitest unit tests (38 tests)
npm run build          # TypeScript type check + Next.js production build
```

All four must pass. The CI pipeline (`.github/workflows/ci.yml`) also runs them on every push.

## Post-Deployment Verification

1. Open the live URL and confirm the dashboard loads.
2. Wait ~5 seconds for the AI rationale call to complete and verify the rationale column populates.
3. Check Langfuse (if configured) for a new `portfolio-rationale` trace.
4. Check Vercel Analytics for page view registration.

## Rollback Procedure

If a bad deployment reaches production:

```bash
# List recent deployments
npx vercel ls --scope own-x-startup

# Promote a specific previous deployment URL back to production
npx vercel promote <deployment-url> --scope own-x-startup
```

## Secrets Rotation

If `OPENAI_API_KEY` is leaked:
1. Go to https://platform.openai.com/api-keys → revoke the leaked key immediately.
2. Generate a new key.
3. Update in Vercel: `npx vercel env rm OPENAI_API_KEY && npx vercel env add OPENAI_API_KEY`
4. Trigger a new deployment so the new key is picked up.
