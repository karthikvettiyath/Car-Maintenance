-- ==========================================
-- Update handle_new_user() trigger to use role from user metadata
-- This allows the signup form to set the user's role
-- ==========================================

-- Update the trigger function to read role from raw_user_meta_data
create or replace function public.handle_new_user()
returns trigger 
language plpgsql 
security definer
set search_path = public
as $$
declare
  user_role text;
begin
  -- Read role from user metadata, default to 'user' if not provided
  user_role := coalesce(new.raw_user_meta_data->>'role', 'user');
  
  -- Validate role value
  if user_role not in ('user', 'admin', 'dealer') then
    user_role := 'user';
  end if;

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    user_role
  );
  return new;
end;
$$;

-- Ensure insert policy exists for profiles
-- (The trigger runs as SECURITY DEFINER so it bypasses RLS,
--  but we also need a policy for the client-side update after signup)
DO $$
BEGIN
  -- Drop and recreate insert policy if it exists
  DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
  CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);
EXCEPTION WHEN others THEN
  NULL;
END $$;

-- Ensure update policy for users to update their own profile exists
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
  CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
EXCEPTION WHEN others THEN
  NULL;
END $$;
