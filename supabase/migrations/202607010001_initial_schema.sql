-- ============================================================
-- TraceQrHub v2 - Initial Database Schema
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- Enum types
-- ============================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'company_member_role') then
    create type public.company_member_role as enum ('owner', 'admin', 'operator');
  end if;

  if not exists (select 1 from pg_type where typname = 'record_status') then
    create type public.record_status as enum ('active', 'inactive');
  end if;

  if not exists (select 1 from pg_type where typname = 'batch_status') then
    create type public.batch_status as enum ('draft', 'processing', 'generated', 'failed');
  end if;

  if not exists (select 1 from pg_type where typname = 'qr_code_status') then
    create type public.qr_code_status as enum ('created', 'printed', 'active', 'revoked');
  end if;

  if not exists (select 1 from pg_type where typname = 'qr_event_type') then
    create type public.qr_event_type as enum (
      'batch_created',
      'qr_generated',
      'pdf_downloaded',
      'pdf_printed',
      'qr_scanned',
      'batch_failed'
    );
  end if;
end $$;

-- ============================================================
-- companies
-- ============================================================

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  tax_id text,
  industry text,
  logo_url text,
  status public.record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- company_members
-- ============================================================

create table if not exists public.company_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null,
  role public.company_member_role not null default 'operator',
  status public.record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint company_members_unique_user unique (company_id, user_id)
);

-- ============================================================
-- products
-- ============================================================

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  sku text not null,
  description text,
  category text,
  status public.record_status not null default 'active',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint products_unique_company_sku unique (company_id, sku)
);

-- ============================================================
-- qr_batches
-- ============================================================

create table if not exists public.qr_batches (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  batch_code text not null,
  name text not null,
  quantity integer not null check (quantity > 0),
  generated_count integer not null default 0 check (generated_count >= 0),
  batch_hash text,
  pdf_file_name text,
  pdf_ready boolean not null default false,
  status public.batch_status not null default 'draft',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint qr_batches_unique_company_batch_code unique (company_id, batch_code)
);

-- ============================================================
-- qr_codes
-- ============================================================

create table if not exists public.qr_codes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  batch_id uuid not null references public.qr_batches(id) on delete cascade,
  short_code text not null unique,
  qr_token text not null unique,
  qr_data text not null,
  status public.qr_code_status not null default 'created',
  printed_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================
-- qr_events
-- ============================================================

create table if not exists public.qr_events (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  batch_id uuid references public.qr_batches(id) on delete cascade,
  qr_code_id uuid references public.qr_codes(id) on delete cascade,
  event_type public.qr_event_type not null,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- updated_at trigger
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_companies_updated_at on public.companies;
create trigger set_companies_updated_at
before update on public.companies
for each row execute function public.set_updated_at();

drop trigger if exists set_company_members_updated_at on public.company_members;
create trigger set_company_members_updated_at
before update on public.company_members
for each row execute function public.set_updated_at();

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists set_qr_batches_updated_at on public.qr_batches;
create trigger set_qr_batches_updated_at
before update on public.qr_batches
for each row execute function public.set_updated_at();

-- ============================================================
-- RLS helper functions
-- ============================================================

create or replace function public.is_company_member(company_uuid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.company_members cm
    where cm.company_id = company_uuid
      and cm.user_id = auth.uid()
      and cm.status = 'active'
  );
$$;

create or replace function public.is_company_admin(company_uuid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.company_members cm
    where cm.company_id = company_uuid
      and cm.user_id = auth.uid()
      and cm.status = 'active'
      and cm.role in ('owner', 'admin')
  );
$$;

create or replace function public.can_manage_company_data(company_uuid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.company_members cm
    where cm.company_id = company_uuid
      and cm.user_id = auth.uid()
      and cm.status = 'active'
      and cm.role in ('owner', 'admin', 'operator')
  );
$$;

-- ============================================================
-- Enable RLS
-- ============================================================

alter table public.companies enable row level security;
alter table public.company_members enable row level security;
alter table public.products enable row level security;
alter table public.qr_batches enable row level security;
alter table public.qr_codes enable row level security;
alter table public.qr_events enable row level security;

-- ============================================================
-- companies policies
-- ============================================================

drop policy if exists companies_select_own on public.companies;
create policy companies_select_own
on public.companies
for select
to authenticated
using (public.is_company_member(id));

drop policy if exists companies_update_admins on public.companies;
create policy companies_update_admins
on public.companies
for update
to authenticated
using (public.is_company_admin(id))
with check (public.is_company_admin(id));

-- ============================================================
-- company_members policies
-- ============================================================

drop policy if exists company_members_select_own_company on public.company_members;
create policy company_members_select_own_company
on public.company_members
for select
to authenticated
using (public.is_company_member(company_id));

drop policy if exists company_members_update_admins on public.company_members;
create policy company_members_update_admins
on public.company_members
for update
to authenticated
using (public.is_company_admin(company_id))
with check (public.is_company_admin(company_id));

-- ============================================================
-- products policies
-- ============================================================

drop policy if exists products_select_company_members on public.products;
create policy products_select_company_members
on public.products
for select
to authenticated
using (public.is_company_member(company_id));

drop policy if exists products_insert_company_users on public.products;
create policy products_insert_company_users
on public.products
for insert
to authenticated
with check (public.can_manage_company_data(company_id));

drop policy if exists products_update_company_users on public.products;
create policy products_update_company_users
on public.products
for update
to authenticated
using (public.can_manage_company_data(company_id))
with check (public.can_manage_company_data(company_id));

drop policy if exists products_delete_company_admins on public.products;
create policy products_delete_company_admins
on public.products
for delete
to authenticated
using (public.is_company_admin(company_id));

-- ============================================================
-- qr_batches policies
-- ============================================================

drop policy if exists qr_batches_select_company_members on public.qr_batches;
create policy qr_batches_select_company_members
on public.qr_batches
for select
to authenticated
using (public.is_company_member(company_id));

drop policy if exists qr_batches_insert_company_users on public.qr_batches;
create policy qr_batches_insert_company_users
on public.qr_batches
for insert
to authenticated
with check (public.can_manage_company_data(company_id));

drop policy if exists qr_batches_update_company_users on public.qr_batches;
create policy qr_batches_update_company_users
on public.qr_batches
for update
to authenticated
using (public.can_manage_company_data(company_id))
with check (public.can_manage_company_data(company_id));

drop policy if exists qr_batches_delete_company_admins on public.qr_batches;
create policy qr_batches_delete_company_admins
on public.qr_batches
for delete
to authenticated
using (public.is_company_admin(company_id));

-- ============================================================
-- qr_codes policies
-- ============================================================

drop policy if exists qr_codes_select_company_members on public.qr_codes;
create policy qr_codes_select_company_members
on public.qr_codes
for select
to authenticated
using (public.is_company_member(company_id));

drop policy if exists qr_codes_update_company_users on public.qr_codes;
create policy qr_codes_update_company_users
on public.qr_codes
for update
to authenticated
using (public.can_manage_company_data(company_id))
with check (public.can_manage_company_data(company_id));

-- ============================================================
-- qr_events policies
-- ============================================================

drop policy if exists qr_events_select_company_members on public.qr_events;
create policy qr_events_select_company_members
on public.qr_events
for select
to authenticated
using (public.is_company_member(company_id));

drop policy if exists qr_events_insert_company_users on public.qr_events;
create policy qr_events_insert_company_users
on public.qr_events
for insert
to authenticated
with check (public.can_manage_company_data(company_id));

-- ============================================================
-- Grants
-- ============================================================

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete
on all tables in schema public
to authenticated;

grant select, insert, update, delete, truncate, references, trigger
on all tables in schema public
to service_role;

grant usage, select, update
on all sequences in schema public
to authenticated, service_role;

alter default privileges in schema public
grant select, insert, update, delete
on tables
to authenticated;

alter default privileges in schema public
grant select, insert, update, delete, truncate, references, trigger
on tables
to service_role;

alter default privileges in schema public
grant usage, select, update
on sequences
to authenticated, service_role;

grant execute on function public.is_company_member(uuid) to authenticated, service_role;
grant execute on function public.is_company_admin(uuid) to authenticated, service_role;
grant execute on function public.can_manage_company_data(uuid) to authenticated, service_role;