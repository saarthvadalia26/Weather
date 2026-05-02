-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  unit_preference text default 'celsius' check (unit_preference in ('celsius', 'fahrenheit')),
  time_format text default '12h' check (time_format in ('12h', '24h')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create saved_locations table
create table public.saved_locations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  city_name text not null,
  country_code text not null,
  lat double precision not null,
  lon double precision not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, lat, lon)
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.saved_locations enable row level security;

-- Profiles Policies
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Saved Locations Policies
create policy "Users can view own saved locations" on public.saved_locations
  for select using (auth.uid() = user_id);

create policy "Users can insert own saved locations" on public.saved_locations
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own saved locations" on public.saved_locations
  for delete using (auth.uid() = user_id);
