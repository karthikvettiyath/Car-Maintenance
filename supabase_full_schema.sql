-- ==========================================
-- 1. PROFILES & ROLES
-- ==========================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  role text default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Constraint for roles (User, Admin, Dealer)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin', 'dealer'));

-- RLS for Profiles
alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Admins can view/update all profiles
create policy "Admins can view all profiles" on public.profiles for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can update all profiles" on public.profiles for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger 
language plpgsql 
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'user');
  return new;
end;
$$;

-- Recreate trigger safely
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==========================================
-- 2. VEHICLES
-- ==========================================
create table if not exists public.vehicles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  make text not null,
  model text not null,
  year integer not null,
  mileage integer not null,
  license_plate text,
  color text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.vehicles enable row level security;

-- Policies
create policy "Users can view own vehicles" on public.vehicles for select using (auth.uid() = user_id);
create policy "Users can insert own vehicles" on public.vehicles for insert with check (auth.uid() = user_id);
create policy "Users can update own vehicles" on public.vehicles for update using (auth.uid() = user_id);
create policy "Users can delete own vehicles" on public.vehicles for delete using (auth.uid() = user_id);

-- DEALER ACCESS: View all vehicles
create policy "Dealers can view all vehicles" on public.vehicles for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'dealer')
);

-- ==========================================
-- 3. SERVICE TYPES
-- ==========================================
create table if not exists public.service_types (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  base_cost numeric,
  interval_km integer,
  interval_months integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.service_types enable row level security;
create policy "Everyone can view service types" on public.service_types for select using (true);

-- Insert default types if empty
insert into public.service_types (name, interval_km, interval_months)
select 'Oil Change', 5000, 6
where not exists (select 1 from public.service_types where name = 'Oil Change');

insert into public.service_types (name, interval_km, interval_months)
select 'Tire Rotation', 10000, 6
where not exists (select 1 from public.service_types where name = 'Tire Rotation');

insert into public.service_types (name, interval_km, interval_months)
select 'Brake Inspection', 20000, 12
where not exists (select 1 from public.service_types where name = 'Brake Inspection');

insert into public.service_types (name, interval_km, interval_months)
select 'General Service', 15000, 12
where not exists (select 1 from public.service_types where name = 'General Service');

-- ==========================================
-- 4. SERVICES (Logs)
-- ==========================================
create table if not exists public.services (
  id uuid default gen_random_uuid() primary key,
  vehicle_id uuid references public.vehicles not null,
  user_id uuid references auth.users not null,
  service_type text not null,
  date date not null,
  cost numeric,
  mileage integer,
  notes text,
  status text check (status in ('upcoming', 'completed')) default 'completed',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.services enable row level security;

create policy "Users can view own services" on public.services for select using (auth.uid() = user_id);
create policy "Users can insert own services" on public.services for insert with check (auth.uid() = user_id);

-- DEALER ACCESS: Insert & View
create policy "Dealers can insert services" on public.services for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'dealer')
);
create policy "Dealers can view all services" on public.services for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'dealer')
);

-- ==========================================
-- 5. MAINTENANCE SCHEDULES
-- ==========================================
create table if not exists public.maintenance_schedules (
  id uuid default gen_random_uuid() primary key,
  vehicle_id uuid references public.vehicles on delete cascade not null,
  service_type_id uuid references public.service_types on delete cascade not null,
  last_performed_date date,
  last_performed_mileage integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(vehicle_id, service_type_id)
);

alter table public.maintenance_schedules enable row level security;

create policy "Users can view own schedules" on public.maintenance_schedules for select using (
  exists (select 1 from public.vehicles where id = maintenance_schedules.vehicle_id and user_id = auth.uid())
);
create policy "Users can update own schedules" on public.maintenance_schedules for update using (
  exists (select 1 from public.vehicles where id = maintenance_schedules.vehicle_id and user_id = auth.uid())
);

-- DEALER ACCESS: View & Update Schedules
create policy "Dealers can view schedules" on public.maintenance_schedules for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'dealer')
);
create policy "Dealers can update schedules" on public.maintenance_schedules for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'dealer')
);

-- ==========================================
-- 6. BACKFILL PROFILES (For existing users)
-- ==========================================
insert into public.profiles (id, email, full_name, role)
select id, email, raw_user_meta_data->>'full_name', 'user'
from auth.users
where id not in (select id from public.profiles);
