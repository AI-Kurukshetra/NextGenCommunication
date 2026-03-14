# 1. Full System Architecture

## High-Level Flow

```text
Developer App / SDK
    |
    | HTTPS + API Key / OAuth
    v
Next.js 14 Route Handlers (Vercel)
    |
    | Service Layer + Repository Layer
    v
Supabase Postgres + Auth + Storage + Realtime
    |
    +--> job_queue (async work)
    +--> webhook_attempts (delivery log)
    +--> usage_records (metering)
    +--> workflows/routes (automation + routing)

Supabase Edge Functions (queue-worker, webhook-dispatch)
    |
    +--> Internal Next.js endpoints
    +--> External customer webhooks
```

## Architectural Decisions

- Multi-tenant data model keyed by `organization_id`.
- API-first backend using Next.js API Route Handlers (`/api/*`).
- Business logic isolated into services; persistence abstracted by repositories.
- Async, retriable workflows using `job_queue` + worker.
- Realtime hooks available via Supabase Realtime channels.
- Security baseline:
  - API keys hashed (`sha256`) and scope-restricted.
  - OAuth client credentials endpoint for machine-to-machine auth.
  - Rate limiting per API key.
  - HMAC signatures for outgoing webhooks.
  - RLS policies for tenant data boundaries.

## Core Runtime Components

- API Auth: `src/server/services/api-auth-service.ts`
- Messaging: `messages-service.ts` + `messages-repository.ts`
- Voice: `voice-service.ts` + `calls-repository.ts`
- Verify: `verify-service.ts` + `otp-repository.ts`
- Webhook Dispatch: `webhook-service.ts` + `webhooks-repository.ts`
- Queue Worker: `process-queue.ts` + Supabase function `queue-worker`

## Scalability Strategies

- Query-path indexes for high-volume entities (`messages`, `calls`, `usage_records`, `job_queue`).
- Soft deletes for safe retention and async archival support.
- Retryable queue with exponential backoff.
- Carrier route abstraction (`routes`, `carriers`) for failover/traffic steering.
- Dedicated usage ledger for billing and analytics rollups.

## Advanced Modules

- AI spam detection: `risk-service.ts::scoreSpam`
- Fraud scoring: `risk-service.ts::fraudRiskScore`
- Intelligent routing: `routing-service.ts::chooseRoute`
- Workflow builder/runtime: `workflow-service.ts::evaluateWorkflow`
- Omnichannel-ready schema: channel fields on templates/routes + extensible payload metadata.
