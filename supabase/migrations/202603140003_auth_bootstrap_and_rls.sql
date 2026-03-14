-- Auth bootstrap + additional RLS policies

alter table users enable row level security;
alter table organization_members enable row level security;
alter table public_leads enable row level security;
alter table public_newsletter enable row level security;

drop policy if exists "users self read" on users;
create policy "users self read"
on users
for select
using (id = auth.uid());

drop policy if exists "users self update" on users;
create policy "users self update"
on users
for update
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "users self insert" on users;
create policy "users self insert"
on users
for insert
with check (id = auth.uid());

drop policy if exists "org members self read" on organization_members;
create policy "org members self read"
on organization_members
for select
using (user_id = auth.uid());

drop policy if exists "public lead intake" on public_leads;
create policy "public lead intake"
on public_leads
for insert
to anon, authenticated
with check (true);

drop policy if exists "public newsletter intake" on public_newsletter;
create policy "public newsletter intake"
on public_newsletter
for insert
to anon, authenticated
with check (true);

create or replace function public.bootstrap_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  email_local text;
  workspace_slug text;
  workspace_name text;
  seeded_org_id uuid := gen_random_uuid();
  seeded_app_slug text := 'default-' || substr(new.id::text, 1, 8);
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.users.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.users.avatar_url),
    updated_at = timezone('utc', now());

  email_local := split_part(coalesce(new.email, new.id::text), '@', 1);
  email_local := lower(regexp_replace(email_local, '[^a-zA-Z0-9]+', '-', 'g'));
  email_local := trim(both '-' from email_local);

  if email_local = '' then
    email_local := 'workspace';
  end if;

  workspace_slug := left(email_local, 40) || '-' || substr(new.id::text, 1, 8);
  workspace_name := initcap(replace(left(email_local, 40), '-', ' ')) || ' Workspace';

  insert into public.organizations (id, name, slug, created_by)
  values (seeded_org_id, workspace_name, workspace_slug, new.id)
  on conflict (slug) do nothing;

  select id
  into seeded_org_id
  from public.organizations
  where slug = workspace_slug
  limit 1;

  if seeded_org_id is null then
    return new;
  end if;

  insert into public.organization_members (organization_id, user_id, role)
  values (seeded_org_id, new.id, 'owner')
  on conflict (organization_id, user_id) do nothing;

  insert into public.applications (organization_id, name, slug, default_from_number)
  values (seeded_org_id, 'Default App', seeded_app_slug, '+14155550111')
  on conflict (organization_id, slug) do nothing;

  insert into public.billing_accounts (organization_id, billing_email, plan, status)
  values (seeded_org_id, new.email, 'growth', 'active')
  on conflict (organization_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.bootstrap_new_user();
