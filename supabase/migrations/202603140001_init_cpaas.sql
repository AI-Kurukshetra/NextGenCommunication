-- NextGen CPaaS initial schema
create extension if not exists "pgcrypto";

-- Enums
create type message_direction as enum ('inbound', 'outbound');
create type message_status as enum ('queued', 'sending', 'sent', 'delivered', 'failed', 'undelivered', 'received');
create type call_direction as enum ('inbound', 'outbound');
create type call_status as enum ('queued', 'initiated', 'ringing', 'in-progress', 'completed', 'failed', 'busy', 'no-answer');
create type number_type as enum ('local', 'toll_free', 'mobile');
create type number_status as enum ('available', 'active', 'porting', 'released', 'suspended');
create type template_status as enum ('draft', 'pending_approval', 'approved', 'rejected', 'archived');
create type campaign_status as enum ('draft', 'scheduled', 'running', 'paused', 'completed', 'failed', 'cancelled');
create type workflow_status as enum ('draft', 'published', 'disabled');
create type job_status as enum ('queued', 'processing', 'succeeded', 'failed');

-- Shared trigger for audit timestamps
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- Users mirrors auth.users while allowing profile fields
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  status text not null default 'active',
  settings jsonb not null default '{}'::jsonb,
  created_by uuid references users(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  user_id uuid not null references users(id),
  role text not null default 'member',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  unique (organization_id, user_id)
);

create table applications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  name text not null,
  slug text not null,
  webhook_url text,
  inbound_message_url text,
  inbound_call_url text,
  default_from_number text,
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  unique (organization_id, slug)
);

create table api_keys (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  application_id uuid not null references applications(id),
  name text not null,
  key_hash text not null unique,
  last_four text not null,
  scopes text[] not null default array[]::text[],
  rate_limit_per_minute integer not null default 120,
  is_active boolean not null default true,
  created_by uuid references users(id),
  last_used_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table oauth_clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  application_id uuid not null references applications(id),
  client_id text not null unique,
  client_secret text not null,
  default_scope text not null default 'messages:write messages:read',
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table oauth_tokens (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  application_id uuid not null references applications(id),
  oauth_client_id uuid not null references oauth_clients(id),
  access_token text not null unique,
  token_type text not null default 'bearer',
  scope text not null,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table carriers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country_code text not null,
  channel text not null,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  unique (name, country_code, channel)
);

create table routes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id),
  application_id uuid references applications(id),
  carrier_id uuid not null references carriers(id),
  channel text not null,
  priority integer not null default 100,
  weight integer not null default 1,
  healthy boolean not null default true,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table phone_numbers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  application_id uuid references applications(id),
  e164_number text not null unique,
  country_code text not null,
  region text,
  number_type number_type not null,
  status number_status not null default 'active',
  capabilities text[] not null default array['sms','voice']::text[],
  provider text not null,
  monthly_cost_usd numeric(10,4) not null default 1.0000,
  purchased_at timestamptz,
  port_requested_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  application_id uuid references applications(id),
  name text not null,
  channel text not null,
  body text not null,
  variables text[] not null default array[]::text[],
  status template_status not null default 'draft',
  approval_notes text,
  approved_by uuid references users(id),
  approved_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  unique (organization_id, name, channel)
);

create table contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  application_id uuid references applications(id),
  phone text not null,
  email text,
  first_name text,
  last_name text,
  tags text[] not null default array[]::text[],
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  unique (organization_id, phone)
);

create table campaigns (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  application_id uuid not null references applications(id),
  template_id uuid references templates(id),
  name text not null,
  status campaign_status not null default 'draft',
  segment_filter jsonb not null default '{}'::jsonb,
  schedule_timezone text,
  scheduled_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  total_recipients integer not null default 0,
  sent_count integer not null default 0,
  failed_count integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  application_id uuid not null references applications(id),
  campaign_id uuid references campaigns(id),
  template_id uuid references templates(id),
  route_id uuid references routes(id),
  to_number text not null,
  from_number text not null,
  direction message_direction not null,
  status message_status not null default 'queued',
  provider text not null,
  provider_message_id text,
  body text,
  media_urls text[] not null default array[]::text[],
  segment_count integer not null default 1,
  risk_score numeric(6,5),
  fraud_score numeric(6,5),
  error_code text,
  error_message text,
  scheduled_at timestamptz,
  sent_at timestamptz,
  delivered_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table delivery_receipts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  message_id uuid not null references messages(id) on delete cascade,
  provider text not null,
  provider_event_id text,
  status message_status not null,
  received_at timestamptz not null default timezone('utc', now()),
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table calls (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  application_id uuid not null references applications(id),
  route_id uuid references routes(id),
  to_number text not null,
  from_number text not null,
  direction call_direction not null,
  status call_status not null,
  provider text not null,
  provider_call_id text,
  answer_url text,
  record boolean not null default false,
  recording_url text,
  started_at timestamptz,
  ended_at timestamptz,
  duration_seconds integer,
  risk_score numeric(6,5),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table call_detail_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  call_id uuid not null references calls(id) on delete cascade,
  billable_seconds integer not null default 0,
  billed_amount_usd numeric(10,4) not null default 0,
  sip_response_code integer,
  from_carrier text,
  to_carrier text,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table webhooks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  application_id uuid references applications(id),
  name text not null,
  url text not null,
  subscribed_events text[] not null,
  signing_secret text not null,
  is_active boolean not null default true,
  timeout_ms integer not null default 5000,
  max_retries integer not null default 10,
  retry_backoff text not null default 'exponential',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table webhook_attempts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  webhook_id uuid not null references webhooks(id) on delete cascade,
  event_type text not null,
  request_payload jsonb not null,
  response_status integer,
  response_body text,
  success boolean not null,
  retry_count integer not null default 0,
  attempted_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table usage_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  application_id uuid references applications(id),
  event_type text not null,
  unit_type text not null,
  units numeric(14,4) not null,
  amount_usd numeric(12,6) not null default 0,
  reference_type text,
  reference_id text,
  occurred_at timestamptz not null default timezone('utc', now()),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table billing_accounts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references organizations(id),
  billing_email text not null,
  plan text not null default 'growth',
  status text not null default 'active',
  currency text not null default 'USD',
  balance_usd numeric(12,4) not null default 0,
  credit_limit_usd numeric(12,4) not null default 1000,
  autopay_enabled boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table workflows (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  application_id uuid references applications(id),
  name text not null,
  trigger_event text not null,
  definition jsonb not null,
  version integer not null default 1,
  status workflow_status not null default 'draft',
  published_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table job_queue (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  job_type text not null,
  payload jsonb not null,
  status job_status not null default 'queued',
  attempts integer not null default 0,
  max_attempts integer not null default 10,
  run_at timestamptz not null default timezone('utc', now()),
  locked_at timestamptz,
  finished_at timestamptz,
  last_error text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table otp_verifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  application_id uuid not null references applications(id),
  to_number text not null,
  code_hash text not null,
  channel text not null default 'sms',
  status text not null default 'pending',
  expires_at timestamptz not null,
  verified_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

-- Indexes for scale and high concurrency access patterns
create index idx_org_members_user on organization_members(user_id) where deleted_at is null;
create index idx_applications_org on applications(organization_id) where deleted_at is null;
create index idx_api_keys_org_app on api_keys(organization_id, application_id) where deleted_at is null;
create index idx_api_keys_key_hash on api_keys(key_hash) where deleted_at is null and is_active = true;
create index idx_phone_numbers_org_status on phone_numbers(organization_id, status) where deleted_at is null;
create index idx_messages_org_created on messages(organization_id, created_at desc) where deleted_at is null;
create index idx_messages_app_status_created on messages(application_id, status, created_at desc) where deleted_at is null;
create index idx_messages_provider_id on messages(provider_message_id) where provider_message_id is not null;
create index idx_messages_to_from on messages(to_number, from_number);
create index idx_receipts_message_received on delivery_receipts(message_id, received_at desc) where deleted_at is null;
create index idx_calls_org_created on calls(organization_id, created_at desc) where deleted_at is null;
create index idx_calls_status_created on calls(status, created_at desc) where deleted_at is null;
create index idx_calls_provider_id on calls(provider_call_id) where provider_call_id is not null;
create index idx_cdr_call on call_detail_records(call_id);
create index idx_contacts_org_tags on contacts using gin(tags);
create index idx_contacts_org_phone on contacts(organization_id, phone) where deleted_at is null;
create index idx_campaign_org_status on campaigns(organization_id, status, scheduled_at);
create index idx_templates_org_status on templates(organization_id, status);
create index idx_webhooks_org_active on webhooks(organization_id, is_active) where deleted_at is null;
create index idx_webhook_attempts_webhook_time on webhook_attempts(webhook_id, attempted_at desc);
create index idx_usage_org_time on usage_records(organization_id, occurred_at desc) where deleted_at is null;
create index idx_usage_app_event on usage_records(application_id, event_type, occurred_at desc) where deleted_at is null;
create index idx_routes_org_channel_priority on routes(organization_id, channel, priority) where deleted_at is null;
create index idx_workflows_org_status on workflows(organization_id, status) where deleted_at is null;
create index idx_jobs_status_runat on job_queue(status, run_at) where deleted_at is null;
create index idx_otp_org_to_created on otp_verifications(organization_id, to_number, created_at desc) where deleted_at is null;

-- Trigger wiring
create trigger set_users_updated_at before update on users for each row execute function set_updated_at();
create trigger set_organizations_updated_at before update on organizations for each row execute function set_updated_at();
create trigger set_org_members_updated_at before update on organization_members for each row execute function set_updated_at();
create trigger set_applications_updated_at before update on applications for each row execute function set_updated_at();
create trigger set_api_keys_updated_at before update on api_keys for each row execute function set_updated_at();
create trigger set_oauth_clients_updated_at before update on oauth_clients for each row execute function set_updated_at();
create trigger set_oauth_tokens_updated_at before update on oauth_tokens for each row execute function set_updated_at();
create trigger set_carriers_updated_at before update on carriers for each row execute function set_updated_at();
create trigger set_routes_updated_at before update on routes for each row execute function set_updated_at();
create trigger set_phone_numbers_updated_at before update on phone_numbers for each row execute function set_updated_at();
create trigger set_templates_updated_at before update on templates for each row execute function set_updated_at();
create trigger set_contacts_updated_at before update on contacts for each row execute function set_updated_at();
create trigger set_campaigns_updated_at before update on campaigns for each row execute function set_updated_at();
create trigger set_messages_updated_at before update on messages for each row execute function set_updated_at();
create trigger set_delivery_receipts_updated_at before update on delivery_receipts for each row execute function set_updated_at();
create trigger set_calls_updated_at before update on calls for each row execute function set_updated_at();
create trigger set_cdr_updated_at before update on call_detail_records for each row execute function set_updated_at();
create trigger set_webhooks_updated_at before update on webhooks for each row execute function set_updated_at();
create trigger set_webhook_attempts_updated_at before update on webhook_attempts for each row execute function set_updated_at();
create trigger set_usage_updated_at before update on usage_records for each row execute function set_updated_at();
create trigger set_billing_accounts_updated_at before update on billing_accounts for each row execute function set_updated_at();
create trigger set_workflows_updated_at before update on workflows for each row execute function set_updated_at();
create trigger set_job_queue_updated_at before update on job_queue for each row execute function set_updated_at();
create trigger set_otp_verifications_updated_at before update on otp_verifications for each row execute function set_updated_at();

-- RLS helpers
create or replace function is_org_member(org_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from organization_members om
    where om.organization_id = org_id
      and om.user_id = auth.uid()
      and om.deleted_at is null
  );
$$;

-- Enable RLS on tenant tables
alter table organizations enable row level security;
alter table applications enable row level security;
alter table api_keys enable row level security;
alter table phone_numbers enable row level security;
alter table messages enable row level security;
alter table calls enable row level security;
alter table campaigns enable row level security;
alter table contacts enable row level security;
alter table templates enable row level security;
alter table webhooks enable row level security;
alter table usage_records enable row level security;
alter table billing_accounts enable row level security;
alter table routes enable row level security;
alter table carriers enable row level security;
alter table workflows enable row level security;
alter table delivery_receipts enable row level security;
alter table call_detail_records enable row level security;
alter table otp_verifications enable row level security;
alter table job_queue enable row level security;

-- Generic read/write policies for org-scoped access
create policy "org read organizations" on organizations for select using (is_org_member(id));
create policy "org read applications" on applications for select using (is_org_member(organization_id));
create policy "org rw applications" on applications for all using (is_org_member(organization_id)) with check (is_org_member(organization_id));
create policy "org rw api_keys" on api_keys for all using (is_org_member(organization_id)) with check (is_org_member(organization_id));
create policy "org rw phone_numbers" on phone_numbers for all using (is_org_member(organization_id)) with check (is_org_member(organization_id));
create policy "org rw messages" on messages for all using (is_org_member(organization_id)) with check (is_org_member(organization_id));
create policy "org rw calls" on calls for all using (is_org_member(organization_id)) with check (is_org_member(organization_id));
create policy "org rw campaigns" on campaigns for all using (is_org_member(organization_id)) with check (is_org_member(organization_id));
create policy "org rw contacts" on contacts for all using (is_org_member(organization_id)) with check (is_org_member(organization_id));
create policy "org rw templates" on templates for all using (is_org_member(organization_id)) with check (is_org_member(organization_id));
create policy "org rw webhooks" on webhooks for all using (is_org_member(organization_id)) with check (is_org_member(organization_id));
create policy "org rw usage_records" on usage_records for all using (is_org_member(organization_id)) with check (is_org_member(organization_id));
create policy "org rw billing_accounts" on billing_accounts for all using (is_org_member(organization_id)) with check (is_org_member(organization_id));
create policy "org rw routes" on routes for all using (organization_id is null or is_org_member(organization_id)) with check (organization_id is null or is_org_member(organization_id));
create policy "all carriers read" on carriers for select using (true);
create policy "org rw workflows" on workflows for all using (is_org_member(organization_id)) with check (is_org_member(organization_id));
create policy "org rw delivery_receipts" on delivery_receipts for all using (is_org_member(organization_id)) with check (is_org_member(organization_id));
create policy "org rw cdr" on call_detail_records for all using (is_org_member(organization_id)) with check (is_org_member(organization_id));
create policy "org rw otp" on otp_verifications for all using (is_org_member(organization_id)) with check (is_org_member(organization_id));
create policy "org rw job_queue" on job_queue for all using (is_org_member(organization_id)) with check (is_org_member(organization_id));
