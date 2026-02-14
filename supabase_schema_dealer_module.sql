-- 1. Update Profiles Role Constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin', 'dealer'));

-- 2. Update Vehicles RLS for Dealers
-- Dealers need to see vehicles to log services for them
CREATE POLICY "Dealers can view all vehicles"
ON public.vehicles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'dealer'
  )
);

-- 3. Update Services RLS for Dealers
-- Dealers can insert service records for ANY vehicle
CREATE POLICY "Dealers can insert services"
ON public.services FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'dealer'
  )
);

-- Dealers can view services they performed (optional, might need a 'created_by' or similar if user_id is the owner)
-- The services table currently has 'user_id' which typically points to the vehicle owner.
-- If a dealer inserts a record, they should probably set 'user_id' to the vehicle owner's ID.
-- We might need to ensure the dealer can find the owner's ID from the vehicle.
-- Since they can read vehicles, they can get the user_id from there.

-- 4. Dealers need to see service history?
-- Maybe only for vehicles they are working on?
-- For now, let's allow dealers to view services for vehicles they have access to (which is all).
CREATE POLICY "Dealers can view all services"
ON public.services FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'dealer'
  )
);
