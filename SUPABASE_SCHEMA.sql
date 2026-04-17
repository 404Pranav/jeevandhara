-- Jeevandhara Supabase Schema (Firebase-auth-compatible client mode)
-- Run this in Supabase SQL Editor.
-- This schema keeps user_id as Firebase UID (text) across activity tables.

create extension if not exists pgcrypto;

-- 1) Core users table
create table if not exists public.users (
    id uuid primary key default gen_random_uuid(),
    firebase_uid text not null unique,
    name text,
    first_name text,
    middle_name text,
    last_name text,
    email text,
    phone text,
    phone_number text,
    gender text,
    blood_group text,
    address text,
    location text,
    postal_code text,
    zip_code text,
    date_of_birth date,
    donation_frequency text,
    last_donation_date date,
    profile_picture_url text,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_users_firebase_uid on public.users(firebase_uid);
create index if not exists idx_users_email on public.users(email);

-- 2) Donation history
create table if not exists public.donation_history (
    id uuid primary key default gen_random_uuid(),
    user_id text not null,
    donation_date date not null,
    blood_center_name text,
    blood_center_location text,
    blood_bank text,
    blood_quantity_ml integer,
    units_donated integer,
    blood_type_collected text,
    donation_status text default 'Completed',
    health_check_status text,
    next_eligible_date date,
    points_earned integer,
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_donation_history_user_id on public.donation_history(user_id);
create index if not exists idx_donation_history_date on public.donation_history(donation_date desc);

-- 3) Badge catalog
create table if not exists public.badges (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    badge_name text,
    description text,
    badge_description text,
    icon text,
    badge_icon_url text,
    criteria text,
    achievement_criteria text,
    points integer not null default 500,
    created_at timestamptz not null default now()
);

-- Seed default badges (safe upsert by name)
insert into public.badges (name, description, icon, criteria, points)
values
    ('First Donation', 'Awarded for first successful donation', 'fa-seedling', 'first_donation', 500),
    ('Regular Donor', 'Awarded for 3 donations', 'fa-shield-heart', 'regular_donor', 1000),
    ('Five Donations', 'Awarded for 5 donations', 'fa-medal', 'five_donations', 1500),
    ('Ten Donations', 'Awarded for 10 donations', 'fa-crown', 'ten_donations', 2500)
on conflict do nothing;

-- 4) User earned badges
create table if not exists public.user_badges (
    id uuid primary key default gen_random_uuid(),
    user_id text not null,
    badge_id uuid not null references public.badges(id) on delete cascade,
    earned_at timestamptz not null default now(),
    earned_date timestamptz,
    created_at timestamptz not null default now(),
    unique(user_id, badge_id)
);

create index if not exists idx_user_badges_user_id on public.user_badges(user_id);
create index if not exists idx_user_badges_badge_id on public.user_badges(badge_id);

-- 5) Rewards
create table if not exists public.rewards (
    id uuid primary key default gen_random_uuid(),
    user_id text not null,
    reward_type text,
    reward_value text,
    reward_description text,
    points_redeemed integer,
    points_used integer,
    earned_date timestamptz not null default now(),
    expiry_date date,
    is_claimed boolean not null default false,
    claimed_date timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_rewards_user_id on public.rewards(user_id);
create index if not exists idx_rewards_claimed on public.rewards(is_claimed);

-- 6) Optional admin email allowlist
create table if not exists public.admin_users (
    email text primary key,
    display_name text,
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

-- Add your admin emails here
-- insert into public.admin_users(email, display_name) values ('admin@example.com', 'Main Admin') on conflict do nothing;

-- 7) updated_at trigger helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists trg_donation_history_updated_at on public.donation_history;
create trigger trg_donation_history_updated_at
before update on public.donation_history
for each row execute function public.set_updated_at();

drop trigger if exists trg_rewards_updated_at on public.rewards;
create trigger trg_rewards_updated_at
before update on public.rewards
for each row execute function public.set_updated_at();

-- 8) RLS (open policies for current Firebase-client architecture)
-- NOTE: Because the app authenticates with Firebase (not Supabase Auth),
-- these policies are permissive to allow browser access via anon key.
-- For production security, move writes/reads to a backend using service role key.

alter table public.users enable row level security;
alter table public.donation_history enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.rewards enable row level security;
alter table public.admin_users enable row level security;

drop policy if exists users_open_access on public.users;
create policy users_open_access on public.users
for all using (true) with check (true);

drop policy if exists donation_history_open_access on public.donation_history;
create policy donation_history_open_access on public.donation_history
for all using (true) with check (true);

drop policy if exists badges_open_access on public.badges;
create policy badges_open_access on public.badges
for all using (true) with check (true);

drop policy if exists user_badges_open_access on public.user_badges;
create policy user_badges_open_access on public.user_badges
for all using (true) with check (true);

drop policy if exists rewards_open_access on public.rewards;
create policy rewards_open_access on public.rewards
for all using (true) with check (true);

drop policy if exists admin_users_open_read on public.admin_users;
create policy admin_users_open_read on public.admin_users
for select using (true);
