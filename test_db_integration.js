
import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres.gjvmyrnbjyvsfareyxdk:gq3zdzrL08kJHCxA@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres';

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function runTests() {
    try {
        console.log('--- DB INTEGRATION TEST START ---');
        await client.connect();
        console.log('Connected to Database');

        // 1. Check Service Types
        console.log('Testing Service Types...');
        const serviceTypesRes = await client.query('SELECT * FROM public.service_types');
        console.log(`Found ${serviceTypesRes.rowCount} service types.`);
        if (serviceTypesRes.rowCount === 0) throw new Error('No service types found');

        // 2. Check Profiles
        console.log('Testing Profiles...');
        const profilesRes = await client.query('SELECT * FROM public.profiles LIMIT 5');
        console.log(`Found ${profilesRes.rowCount} profiles.`);
        profilesRes.rows.forEach(p => console.log(`- ${p.email} (${p.role})`));

        // 3. Test a mock vehicle insertion (Clean up after)
        // Since we don't want to mess with auth.users directly easily, 
        // we'll just check if the vehicles table exists and has data.
        console.log('Testing Vehicles...');
        const vehiclesRes = await client.query('SELECT * FROM public.vehicles LIMIT 5');
        console.log(`Found ${vehiclesRes.rowCount} vehicles.`);

        // 4. Test Services
        console.log('Testing Services...');
        const servicesRes = await client.query('SELECT * FROM public.services LIMIT 5');
        console.log(`Found ${servicesRes.rowCount} service logs.`);

        console.log('--- DB INTEGRATION TEST SUCCESS ---');
    } catch (err) {
        console.error('--- DB INTEGRATION TEST FAILED ---');
        console.error(err.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

runTests();
