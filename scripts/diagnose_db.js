
import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres.gjvmyrnbjyvsfareyxdk:gq3zdzrL08kJHCxA@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres';

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();
        console.log('Connected!');

        // 1. Check tables
        const tables = await client.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'");
        console.log('Tables:', tables.rows.map(r => r.tablename));

        // 2. Check profiles data
        if (tables.rows.some(r => r.tablename === 'profiles')) {
            const profiles = await client.query("SELECT role, COUNT(*) FROM public.profiles GROUP BY role");
            console.log('Roles Distribution:', profiles.rows);

            const policies = await client.query("SELECT policyname, qual, cmd FROM pg_policies WHERE tablename = 'profiles'");
            console.log('Policies on profiles:', JSON.stringify(policies.rows, null, 2));
        }

        // 3. Check functions (like get_user_role)
        const functions = await client.query("SELECT r.routine_name, r.routine_schema, p.proowner::regrole as proowner FROM information_schema.routines r JOIN pg_proc p ON p.proname = r.routine_name WHERE r.routine_schema = 'public' AND r.routine_name = 'get_user_role'");
        console.log('Functions:', JSON.stringify(functions.rows, null, 2));

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
