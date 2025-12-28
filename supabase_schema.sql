-- Create vehicles table
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

-- Enable RLS for vehicles
alter table public.vehicles enable row level security;

-- Create policies for vehicles
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

-- Create services table
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

-- Enable RLS for services
alter table public.services enable row level security;

-- Create policies for services
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
