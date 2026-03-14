-- Wave 1 foundations: emergency services, SIP/WebRTC, CDR reporting support, quotas

create table if not exists emergency_locations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  label text not null,
  country_code text not null default 'US',
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state_region text not null,
  postal_code text not null,
  latitude numeric(9,6),
  longitude numeric(9,6),
  is_validated boolean not null default false,
  validated_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table if not exists emergency_number_assignments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  phone_number_id uuid not null references phone_numbers(id),
  emergency_location_id uuid not null references emergency_locations(id),
  is_active boolean not null default true,
  activated_at timestamptz not null default timezone('utc', now()),
  deactivated_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create unique index if not exists idx_emergency_assignment_active_phone
on emergency_number_assignments(phone_number_id)
where is_active = true and deleted_at is null;

create table if not exists sip_endpoints (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  application_id uuid not null references applications(id),
  name text not null,
  username text not null,
  password_secret text not null,
  domain text not null,
  transport text not null default 'udp',
  codecs text[] not null default array['pcmu','opus']::text[],
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  unique (organization_id, name)
);

create table if not exists webrtc_sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  application_id uuid not null references applications(id),
  call_id uuid references calls(id),
  room_name text not null,
  session_token text not null unique,
  status text not null default 'active',
  expires_at timestamptz not null,
  ended_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table if not exists api_quotas (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  application_id uuid references applications(id),
  quota_key text not null,
  limit_value integer not null check (limit_value > 0),
  quota_window text not null check (quota_window in ('daily','monthly')),
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create index if not exists idx_emergency_locations_org
on emergency_locations(organization_id, created_at desc)
where deleted_at is null;

create index if not exists idx_emergency_assignments_org
on emergency_number_assignments(organization_id, created_at desc)
where deleted_at is null;

create index if not exists idx_sip_endpoints_org_app
on sip_endpoints(organization_id, application_id)
where deleted_at is null;

create index if not exists idx_webrtc_sessions_org_status
on webrtc_sessions(organization_id, status, expires_at desc)
where deleted_at is null;

create index if not exists idx_api_quotas_org_app
on api_quotas(organization_id, application_id, quota_key, quota_window)
where deleted_at is null and is_active = true;

alter table emergency_locations enable row level security;
alter table emergency_number_assignments enable row level security;
alter table sip_endpoints enable row level security;
alter table webrtc_sessions enable row level security;
alter table api_quotas enable row level security;

drop policy if exists "org rw emergency_locations" on emergency_locations;
create policy "org rw emergency_locations"
on emergency_locations
for all
using (is_org_member(organization_id))
with check (is_org_member(organization_id));

drop policy if exists "org rw emergency_assignments" on emergency_number_assignments;
create policy "org rw emergency_assignments"
on emergency_number_assignments
for all
using (is_org_member(organization_id))
with check (is_org_member(organization_id));

drop policy if exists "org rw sip_endpoints" on sip_endpoints;
create policy "org rw sip_endpoints"
on sip_endpoints
for all
using (is_org_member(organization_id))
with check (is_org_member(organization_id));

drop policy if exists "org rw webrtc_sessions" on webrtc_sessions;
create policy "org rw webrtc_sessions"
on webrtc_sessions
for all
using (is_org_member(organization_id))
with check (is_org_member(organization_id));

drop policy if exists "org rw api_quotas" on api_quotas;
create policy "org rw api_quotas"
on api_quotas
for all
using (is_org_member(organization_id))
with check (is_org_member(organization_id));

drop trigger if exists set_emergency_locations_updated_at on emergency_locations;
create trigger set_emergency_locations_updated_at
before update on emergency_locations
for each row execute function set_updated_at();

drop trigger if exists set_emergency_assignments_updated_at on emergency_number_assignments;
create trigger set_emergency_assignments_updated_at
before update on emergency_number_assignments
for each row execute function set_updated_at();

drop trigger if exists set_sip_endpoints_updated_at on sip_endpoints;
create trigger set_sip_endpoints_updated_at
before update on sip_endpoints
for each row execute function set_updated_at();

drop trigger if exists set_webrtc_sessions_updated_at on webrtc_sessions;
create trigger set_webrtc_sessions_updated_at
before update on webrtc_sessions
for each row execute function set_updated_at();

drop trigger if exists set_api_quotas_updated_at on api_quotas;
create trigger set_api_quotas_updated_at
before update on api_quotas
for each row execute function set_updated_at();
