create table if not exists public_leads (
  id uuid primary key default gen_random_uuid(),
  lead_type text not null,
  name text not null,
  email text not null,
  company text not null,
  use_case text not null,
  message text,
  source text not null default 'marketing',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public_newsletter (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text not null default 'marketing',
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_public_leads_created on public_leads(created_at desc);
create index if not exists idx_public_newsletter_created on public_newsletter(created_at desc);
