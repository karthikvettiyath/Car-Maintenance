import { createClient } from '@supabase/supabase-js';

// TODO: Replace with Real Keys provided by user or use a backend proxy. 
// Since we cannot run raw SQL from browser with just the connection string easily/securely usually.
// However, the user wants us to Use the DB.

// Ideally we need:
// VITE_SUPABASE_URL=https://pqmfjwihhrbawxsfrjiy.supabase.co
// VITE_SUPABASE_ANON_KEY=...

// For now, I will keep using the mock data UNTIL I get the keys, BUT 
// I will structure the services to be ready to swap.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase keys are missing!', { supabaseUrl, supabaseAnonKey });
} else {
    console.log('Supabase client initializing with URL:', supabaseUrl);
}

export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Helper to check connection (mocked for now)
export const isMockMode = !supabase;
