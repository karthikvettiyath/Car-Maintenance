-- ⚠️ WARNING: This will DESTRUCTIVELY reset your database tables.
-- It uses CASCADE to forcibly remove 'vehicles' and any legacy tables (like 'maintenance_records', 'reminders') linked to it.

-- 1. Drop tables with CASCADE to remove dependencies
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.maintenance_records CASCADE; -- Removing legacy/conflicting table found in error logs
DROP TABLE IF EXISTS public.reminders CASCADE;          -- Removing legacy/conflicting table found in error logs
DROP TABLE IF EXISTS public.vehicles CASCADE;

-- 2. Create vehicles table
create table public.vehicles (
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

-- 3. Enable RLS for vehicles
alter table public.vehicles enable row level security;

-- 4. Create policies for vehicles
create policy "Users can view their own vehicles"
  on public.vehicles for select
  using (auth.uid() = user_id);

create policy "Users can insert their own vehicles"
  on public.vehicles for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own vehicles"
  on public.vehicles for update
  using (auth.uid() = user_id);

create policy "Users can delete their own vehicles"
  on public.vehicles for delete
  using (auth.uid() = user_id);

-- 5. Create services table
create table public.services (
  id uuid default gen_random_uuid() primary key,
  vehicle_id uuid references public.vehicles on delete cascade not null,
  user_id uuid references auth.users not null,
  service_type text not null,
  date date not null,
  cost numeric,
  notes text,
  status text check (status in ('upcoming', 'completed')) default 'upcoming',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Enable RLS for services
alter table public.services enable row level security;

-- 7. Create policies for services
create policy "Users can view their own services"
  on public.services for select
  using (auth.uid() = user_id);

create policy "Users can insert their own services"
  on public.services for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own services"
  on public.services for update
  using (auth.uid() = user_id);

create policy "Users can delete their own services"
  on public.services for delete
  using (auth.uid() = user_id);
