
import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres.gjvmyrnbjyvsfareyxdk:gq3zdzrL08kJHCxA@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres';

const sql = `
BEGIN;

-- 1. Create Helper Function to avoid recursion
CREATE OR REPLACE FUNCTION public.get_user_role(target_id uuid)
RETURNS text
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  returned_role text;
BEGIN
  SELECT role INTO returned_role FROM public.profiles WHERE id = target_id;
  RETURN returned_role;
END;
$$ LANGUAGE plpgsql;

-- 2. Revoke public execute and grant only to authenticated roles if needed, 
-- but usually SECURITY DEFINER is enough.

-- 3. Drop existing problematic policies
DROP POLICY IF EXISTS "Select profiles" ON public.profiles;
DROP POLICY IF EXISTS "Update profiles" ON public.profiles;

-- 4. Create Non-Recursive Policies
CREATE POLICY "Select profiles" ON public.profiles FOR SELECT
USING (
  (auth.uid() = id)                              -- User sees themselves
  OR
  (get_user_role(auth.uid()) IN ('admin', 'dealer')) -- Admin/Dealer sees all
);

CREATE POLICY "Update profiles" ON public.profiles FOR UPDATE
USING (
  (auth.uid() = id)                              -- User updates themselves
  OR
  (get_user_role(auth.uid()) = 'admin')          -- Admin updates all
);

-- 5. Ensure Trigger captures role from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'user')
  );
  RETURN new;
END;
$$;

-- 6. Promote existing user to admin (for testing)
UPDATE public.profiles SET role = 'admin' WHERE email = 'karthikvr.mec@gmail.com';
UPDATE public.profiles SET role = 'admin' WHERE email = 'adithyanvs105@gmail.com';

COMMIT;
`;

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log('Connecting...');
        await client.connect();
        console.log('Connected! Running Full DB Optimization...');
        await client.query(sql);
        console.log('DB Optimization successful!');
    } catch (err) {
        console.error('Migration failed:', err.message);
        console.error(err.stack);
    } finally {
        await client.end();
    }
}

run();
