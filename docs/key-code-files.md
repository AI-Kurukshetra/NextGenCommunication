# 5. Key Code Files

## Backend Core

- `apps/web/src/server/services/api-auth-service.ts`:
  API key + OAuth authentication, scope checks, and rate limiting.
- `apps/web/src/server/services/messages-service.ts`:
  SMS/MMS send flow, inbound handling, delivery status updates, usage metering.
- `apps/web/src/server/services/voice-service.ts`:
  Call creation and call completion metering.
- `apps/web/src/server/services/verify-service.ts`:
  OTP start/check workflow.
- `apps/web/src/server/services/webhook-service.ts`:
  Signed webhook dispatch + attempt logging.
- `apps/web/src/server/workers/process-queue.ts`:
  Queue polling and retry behavior.

## API Layer

- `apps/web/app/api/messages/send/route.ts`
- `apps/web/app/api/messages/[id]/route.ts`
- `apps/web/app/api/voice/call/route.ts`
- `apps/web/app/api/numbers/purchase/route.ts`
- `apps/web/app/api/verify/start/route.ts`
- `apps/web/app/api/verify/check/route.ts`
- `apps/web/app/api/webhooks/[provider]/route.ts`
- `apps/web/app/api/usage/summary/route.ts`
- `apps/web/app/api/analytics/overview/route.ts`

## Dashboard UI

- `apps/web/app/(dashboard)/layout.tsx`
- `apps/web/app/(dashboard)/dashboard/page.tsx`
- `apps/web/src/components/dashboard/usage-chart.tsx`
- `apps/web/src/components/dashboard/realtime-indicator.tsx`

## SDK

- `packages/sdk/src/client.ts`
- `packages/sdk/src/resources/messages.ts`
- `packages/sdk/src/resources/voice.ts`
- `packages/sdk/src/resources/numbers.ts`
- `packages/sdk/src/resources/verify.ts`
