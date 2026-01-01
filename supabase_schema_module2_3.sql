-- 1. Create Master Table for Service Types
create table if not exists public.service_types (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  interval_km integer default 0,
  interval_months integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for service_types
alter table public.service_types enable row level security;

-- Allow everyone to read service types
create policy "Allow public read access" on public.service_types for select using (true);


-- 2. Create Maintenance Schedules Table (State of each service for each car)
create table if not exists public.maintenance_schedules (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  vehicle_id uuid references public.vehicles on delete cascade not null,
  service_type_id uuid references public.service_types on delete cascade not null,
  last_performed_date date not null default CURRENT_DATE,
  last_performed_mileage integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(vehicle_id, service_type_id)
);

-- Enable RLS for maintenance_schedules
alter table public.maintenance_schedules enable row level security;

-- Create policies for maintenance_schedules
create policy "Users can view their own schedules"
  on public.maintenance_schedules for select
  using (auth.uid() = user_id);

create policy "Users can insert their own schedules"
  on public.maintenance_schedules for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own schedules"
  on public.maintenance_schedules for update
  using (auth.uid() = user_id);

create policy "Users can delete their own schedules"
  on public.maintenance_schedules for delete
  using (auth.uid() = user_id);


-- 3. Seed Data (Idempotent-ish)
insert into public.service_types (name, interval_km, interval_months)
select 'Oil Change', 5000, 6
where not exists (select 1 from public.service_types where name = 'Oil Change');

insert into public.service_types (name, interval_km, interval_months)
select 'Tire Rotation', 10000, 6
where not exists (select 1 from public.service_types where name = 'Tire Rotation');

insert into public.service_types (name, interval_km, interval_months)
select 'General Inspection', 15000, 12
where not exists (select 1 from public.service_types where name = 'General Inspection');

insert into public.service_types (name, interval_km, interval_months)
select 'Brake Inspection', 20000, 12
where not exists (select 1 from public.service_types where name = 'Brake Inspection');

insert into public.service_types (name, interval_km, interval_months)
select 'Insurance Renewal', 0, 12
where not exists (select 1 from public.service_types where name = 'Insurance Renewal');
