# NextGen CPaaS Platform

Production-ready CPaaS foundation (Twilio/Bandwidth-style) built on Next.js 14 + Supabase.

## Stack

- Frontend: Next.js 14 App Router + Server Components + TypeScript
- Backend: Next.js Route Handlers + Supabase Edge Functions
- DB/Auth/Storage/Realtime: Supabase
- Deployment: Vercel (app) + Supabase (DB/functions)
- SDK: `packages/sdk` Node.js package

## Quick Start

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Copy env:
   ```bash
   cp .env.example .env
   ```
3. Start Supabase local stack and apply schema:
   ```bash
   supabase start
   supabase db reset
   pnpm supabase:seed
   ```
4. Run web app:
   ```bash
   pnpm dev
   ```
5. Build SDK:
   ```bash
   pnpm --filter @nextgen/cpaas-sdk build
   ```

### Local Auth Seed

`pnpm supabase:seed` creates a default user and core org/app fixtures.
Each demo user receives a separate `demo-*` organization with distinct dashboard data.

Demo logins:

- `owner@nextgen.dev` / `Nextgen123!`
- `ops@nextgen.dev` / `Nextgen123!`
- `analyst@nextgen.dev` / `Nextgen123!`
- `support@nextgen.dev` / `Nextgen123!`

## Architecture Docs

- [System Architecture](./docs/system-architecture.md)
- [Database Schema](./docs/database-schema.md)
- [API Specification](./docs/api-spec.md)
- [OpenAPI](./docs/openapi.yaml)
- [Folder Structure](./docs/folder-structure.md)
- [Key Code Files](./docs/key-code-files.md)
- [Feature Coverage Matrix](./docs/feature-coverage-matrix.md)
- [Deployment Guide](./docs/deployment-guide.md)

## Core Modules Implemented

- SMS/MMS API (send, inbound webhook ingest, status updates, delivery events)
- Voice API (outbound call creation, call-end event handling, usage)
- Phone number purchase, porting, and application assignment
- Webhook dispatch system with signing + attempts log + retry queue
- API key auth + OAuth client-credential token endpoint + rate limiting
- Usage metering (segments, calls, durations, event unit billing)
- Campaign system foundation with scheduling via queue
- Contacts + CSV import endpoint
- Message templates + approval workflow
- 2FA Verify API (`start` / `check`)
- Advanced module foundations: spam/fraud scoring, route selection, workflows

## SDK Example

```ts
import { CPaaSClient } from "@nextgen/cpaas-sdk";

const client = new CPaaSClient({
  apiKey: process.env.CPAAS_API_KEY!,
  baseUrl: "http://localhost:3000"
});

await client.messages.send({
  to: "+1234567890",
  from: "+1987654321",
  text: "Hello World"
});
```
