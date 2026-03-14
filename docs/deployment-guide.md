# 10. Deployment Guide

## Environment Variables

Set in Vercel and local `.env`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`
- `CPAAS_WEBHOOK_SIGNING_SECRET`
- `CPAAS_INTERNAL_TOKEN`
- `CPAAS_DEFAULT_SMS_PROVIDER`
- `CPAAS_DEFAULT_VOICE_PROVIDER`
- `CPAAS_APP_URL`

## Supabase Setup

1. Create Supabase project.
2. Run migration:
   ```bash
   supabase db push
   ```
3. Seed data:
   ```bash
   supabase db reset
   ```
4. Deploy Edge Functions:
   ```bash
   supabase functions deploy queue-worker
   supabase functions deploy webhook-dispatch
   ```
5. Configure function secrets:
   ```bash
   supabase secrets set CPAAS_APP_URL=https://your-vercel-app.vercel.app
   supabase secrets set CPAAS_INTERNAL_TOKEN=...
   supabase secrets set CPAAS_WEBHOOK_SIGNING_SECRET=...
   ```

## Vercel Setup

1. Import repository in Vercel.
2. Build command: `pnpm build`
3. Output: default Next.js
4. Add all env vars.
5. Deploy.

## CI/CD

- PR: lint + typecheck + build
- Main: deploy to Vercel + run Supabase migration pipeline

## Migrations & Seed Strategy

- New schema changes: add numbered SQL file in `supabase/migrations`.
- Backfill scripts: add idempotent SQL migrations.
- Seed: only dev fixtures in `supabase/seed.sql`.

## Webhook Reliability

- Persist events in `job_queue`.
- Worker retries with exponential backoff.
- Log each attempt in `webhook_attempts`.
- Send HMAC signature header (`x-nextgen-signature`).

## Scale Readiness Checklist

- Partition `messages`, `calls`, `usage_records` by time at high volume.
- Move in-memory rate limit to Redis/Upstash.
- Add managed queue/broker if job volume outgrows Postgres queue.
- Add provider connectors and failover routing per destination/carrier health.
