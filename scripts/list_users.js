
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

        const res = await client.query("SELECT email, role FROM public.profiles");
        console.log('Users:', JSON.stringify(res.rows, null, 2));

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
