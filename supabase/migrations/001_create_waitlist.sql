-- SellerSyncHub — Waitlist signups table
-- Run this in your Supabase SQL editor or via the Supabase CLI

create table if not exists public.waitlist_signups (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  source      text,
  user_agent  text,
  created_at  timestamptz not null default now(),

  constraint waitlist_signups_email_unique unique (email)
);

-- Index for fast duplicate lookups
create index if not exists waitlist_signups_email_idx
  on public.waitlist_signups (email);

-- RLS: deny all direct client access — the API route uses the service role key
alter table public.waitlist_signups enable row level security;

-- Admins can read via the Supabase dashboard
comment on table public.waitlist_signups is
  'Stores early-access waitlist sign-ups collected via the landing page.';
