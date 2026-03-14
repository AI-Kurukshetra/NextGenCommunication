# 2. Database Schema

Migration file: `supabase/migrations/202603140001_init_cpaas.sql`

## Required Core Tables

- `users`
- `organizations`
- `applications`
- `api_keys`
- `phone_numbers`
- `messages`
- `calls`
- `campaigns`
- `contacts`
- `templates`
- `webhooks`
- `usage_records`
- `call_detail_records`
- `delivery_receipts`
- `billing_accounts`
- `routes`
- `carriers`
- `workflows`

## Supporting Tables

- `organization_members`
- `webhook_attempts`
- `job_queue`
- `otp_verifications`
- `oauth_clients`
- `oauth_tokens`

## Design Notes

- All tenant entities include:
  - `organization_id`
  - `created_at`
  - `updated_at`
  - `deleted_at` (soft delete)
- `set_updated_at()` trigger keeps `updated_at` accurate.
- Enum types enforce state integrity (`message_status`, `call_status`, etc.).
- GIN index on `contacts.tags` supports segmentation queries.
- RLS is enabled on all tenant tables with `is_org_member(org_id)` policy checks.

## Key Indexes

- `messages`: org + created_at, app + status + created_at, provider message id
- `calls`: org + created_at, status + created_at, provider call id
- `usage_records`: org + occurred_at, app + event_type + occurred_at
- `job_queue`: status + run_at for worker scans
- `api_keys`: `key_hash` active lookup

## Seed Data

`supabase/seed.sql` includes a local org/app/API key/oauth client and sample webhook.
