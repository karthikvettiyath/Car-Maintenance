import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres.gjvmyrnbjyvsfareyxdk:zro1byghf3KDSI6U@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres';

const client = new Client({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

const schema = `
  -- Enable UUID extension
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

  -- Vehicles Table
  CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    mileage INTEGER NOT NULL,
    color TEXT,
    image_url TEXT,
    license_plate TEXT,
    vin TEXT
  );

  -- Maintenance Records Table
  CREATE TABLE IF NOT EXISTS maintenance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
    service_type TEXT NOT NULL,
    date DATE NOT NULL,
    mileage INTEGER NOT NULL,
    cost DECIMAL(10,2),
    provider TEXT,
    notes TEXT
  );

  -- Reminders Table
  CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
    service_type TEXT NOT NULL,
    due_date DATE,
    due_mileage INTEGER,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue')),
    notes TEXT
  );
`;

async function setupDatabase() {
    try {
        await client.connect();
        console.log('Connected to database...');

        await client.query(schema);
        console.log('Schema created successfully!');

        // Check if we need seed data
        const res = await client.query('SELECT count(*) FROM vehicles');
        if (res.rows[0].count === '0') {
            console.log('Seeding initial data...');
            const vehicleQuery = `
            INSERT INTO vehicles (make, model, year, mileage, color, image_url)
            VALUES 
            ('Toyota', 'Corolla', 2020, 45000, 'White', 'https://images.unsplash.com/photo-1590362835106-1c41b3340476?w=800&auto=format&fit=crop&q=60'),
            ('Honda', 'Civic', 2018, 72000, 'Blue', 'https://images.unsplash.com/photo-1626856555541-697b4ec8b22a?w=800&auto=format&fit=crop&q=60')
            RETURNING id;
        `;
            const vehicleRes = await client.query(vehicleQuery);
            const vehicleId = vehicleRes.rows[0].id;

            // Seed service
            await client.query(`
            INSERT INTO maintenance_records (vehicle_id, service_type, date, mileage, cost, notes)
            VALUES ($1, 'Oil Change', '2025-10-15', 40000, 50, 'Synthetic oil used')
        `, [vehicleId]);

            // Seed reminder
            await client.query(`
            INSERT INTO reminders (vehicle_id, service_type, due_date, status)
            VALUES ($1, 'Insurance Renewal', '2026-01-15', 'pending')
        `, [vehicleId]);

            console.log('Seed data inserted.');
        }

    } catch (err) {
        console.error('Error setting up database:', err);
    } finally {
        await client.end();
    }
}

setupDatabase();
