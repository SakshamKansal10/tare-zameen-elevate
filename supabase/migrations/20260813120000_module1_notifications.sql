-- Module 1: WhatsApp / Email Notifications
-- Donor profile, minimal donation/receipt/recurring-donation records,
-- notification preferences, and notification logs — plus Row Level
-- Security so a donor can only ever see their own data.
--
-- Run this once via the Supabase SQL editor, or `supabase db push` if the
-- project is linked with the Supabase CLI.

create extension if not exists "pgcrypto";

-- ── donors ──────────────────────────────────────────────────────────────
-- One row per Supabase Auth user. Created automatically by the
-- handle_new_user trigger below — never insert into this table directly.
create table public.donors (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text, -- E.164, e.g. +919876543210 — required only to enable WhatsApp
  is_staff boolean not null default false, -- manual staff/admin flag, see docs
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index donors_email_idx on public.donors (email);

alter table public.donors enable row level security;

create policy "Donors can view own profile"
  on public.donors for select
  using (auth.uid() = id);

create policy "Donors can update own profile"
  on public.donors for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.donors (id, full_name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data ->> 'phone'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── recurring_donations ─────────────────────────────────────────────────
create table public.recurring_donations (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid not null references public.donors (id) on delete cascade,
  amount_inr numeric(12, 2) not null check (amount_inr > 0),
  frequency text not null default 'monthly' check (frequency in ('monthly')),
  campaign_name text,
  status text not null default 'active' check (status in ('active', 'paused', 'cancelled')),
  next_charge_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index recurring_donations_donor_id_idx on public.recurring_donations (donor_id);
create index recurring_donations_next_charge_date_idx on public.recurring_donations (next_charge_date);

alter table public.recurring_donations enable row level security;

create policy "Donors can view own recurring donations"
  on public.recurring_donations for select
  using (auth.uid() = donor_id);
-- No insert/update/delete policy for `authenticated`: writes happen via
-- server functions using the service-role client, after an app-level
-- ownership check (src/server/functions/recurring.ts). RLS here is
-- defense-in-depth for reads.

-- ── donations ───────────────────────────────────────────────────────────
-- Deliberately minimal — this is NOT a payment gateway integration. It is
-- the record Module 1's notification triggers hook into. See
-- docs/MODULE1_NOTIFICATIONS.md.
create table public.donations (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid not null references public.donors (id) on delete cascade,
  recurring_donation_id uuid references public.recurring_donations (id) on delete set null,
  amount_inr numeric(12, 2) not null check (amount_inr > 0),
  campaign_name text,
  status text not null check (status in ('succeeded', 'failed')),
  reference_id text not null unique,
  failure_reason text,
  created_at timestamptz not null default now()
);

create index donations_donor_id_idx on public.donations (donor_id);

alter table public.donations enable row level security;

create policy "Donors can view own donations"
  on public.donations for select
  using (auth.uid() = donor_id);

-- ── receipts ────────────────────────────────────────────────────────────
create table public.receipts (
  id uuid primary key default gen_random_uuid(),
  donation_id uuid not null unique references public.donations (id) on delete cascade,
  receipt_number text not null unique,
  generated_at timestamptz not null default now()
);

alter table public.receipts enable row level security;

create policy "Donors can view own receipts"
  on public.receipts for select
  using (
    donation_id in (select id from public.donations where donor_id = auth.uid())
  );

-- ── notification_preferences ──────────────────────────────────────────
-- Generic (donor, notificationType) design — absence of a row means "use
-- the default from the NOTIFICATION_TYPES registry in application code".
create table public.notification_preferences (
  donor_id uuid not null references public.donors (id) on delete cascade,
  notification_type text not null check (
    notification_type in (
      'DONATION_CONFIRMED', 'RECEIPT_READY', 'RECURRING_DONATION_CHARGED',
      'RECURRING_DONATION_REMINDER', 'MONTHLY_IMPACT_SUMMARY'
    )
  ),
  email_enabled boolean not null default true,
  whatsapp_enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (donor_id, notification_type)
);

alter table public.notification_preferences enable row level security;

create policy "Donors can view own preferences"
  on public.notification_preferences for select
  using (auth.uid() = donor_id);

create policy "Donors can insert own preferences"
  on public.notification_preferences for insert
  with check (auth.uid() = donor_id);

create policy "Donors can update own preferences"
  on public.notification_preferences for update
  using (auth.uid() = donor_id)
  with check (auth.uid() = donor_id);
-- Note: whether a transactional notification type can actually be disabled
-- is enforced in application code (src/server/notifications/preferences.ts),
-- not here — that business rule lives in the single NOTIFICATION_TYPES
-- registry so it never drifts between the DB and the notification engine.

-- ── notification_logs ───────────────────────────────────────────────────
create table public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid not null references public.donors (id) on delete cascade,
  notification_type text not null,
  channel text not null check (channel in ('email', 'whatsapp')),
  template_key text not null,
  recipient text not null,
  subject text,
  provider text not null,
  provider_message_id text,
  status text not null check (status in ('QUEUED', 'SENT', 'DELIVERED', 'FAILED', 'SKIPPED')),
  error_code text,
  error_message text,
  idempotency_key text unique,
  metadata jsonb,
  queued_at timestamptz not null default now(),
  sent_at timestamptz,
  delivered_at timestamptz,
  failed_at timestamptz,
  created_at timestamptz not null default now()
);

create index notification_logs_donor_id_idx on public.notification_logs (donor_id);
create index notification_logs_created_at_idx on public.notification_logs (created_at desc);
create index notification_logs_type_idx on public.notification_logs (notification_type);

alter table public.notification_logs enable row level security;

create policy "Donors can view own notification logs"
  on public.notification_logs for select
  using (auth.uid() = donor_id);
-- No write policies for `authenticated` — only the service-role client
-- (src/server/notifications/service.ts) inserts/updates log rows.
