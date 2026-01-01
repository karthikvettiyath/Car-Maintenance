-- Add mileage column to services table
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS mileage integer;

-- Optional: Update existing services mileage based on vehicle mileage (approximate, since we don't know the past mileage)
-- We won't do this blindly to avoid bad data, but we make the column nullable for now.
