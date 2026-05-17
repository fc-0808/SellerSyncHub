-- Waitlist: record click-through acceptance of Privacy + Seller Application Terms
-- (Etsy API Terms §3 — Application Terms must be enforceable, e.g. click-through)

alter table public.waitlist_signups
  add column if not exists privacy_policy_version text,
  add column if not exists application_terms_version text,
  add column if not exists consented_at timestamptz;

comment on column public.waitlist_signups.privacy_policy_version is
  'Version string of /privacy accepted at signup (matches lib/legal/constants).';
comment on column public.waitlist_signups.application_terms_version is
  'Version string of /application-terms accepted at signup.';
comment on column public.waitlist_signups.consented_at is
  'UTC timestamp when the user accepted policies on the waitlist form.';
