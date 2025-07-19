import * as schema from "@shared/schema";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nwdgtdzrcyfmislilucy.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseKey) {
  throw new Error("SUPABASE_ANON_KEY must be set");
}

console.log('Initializing Supabase client...');

// DIAGNOSTIC: Log environment variables
console.log('[ENV] SUPABASE_URL:', process.env.SUPABASE_URL?.slice(0, 30) + '...');
console.log('[ENV] SUPABASE_ANON_KEY length:', process.env.SUPABASE_ANON_KEY?.length);
console.log('[ENV] SUPABASE_SERVICE_ROLE_KEY length:', process.env.SUPABASE_SERVICE_ROLE_KEY?.length);
console.log('[ENV] SUPABASE_SECRET_KEY length:', process.env.SUPABASE_SECRET_KEY?.length);

// Create Supabase client with anon key for regular operations
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Create Supabase admin client with priority: secret key > service role key > anon key
const adminKey = supabaseSecretKey || supabaseServiceKey || supabaseKey;
console.log('Admin client using key type:', supabaseSecretKey ? 'SECRET' : supabaseServiceKey ? 'SERVICE_ROLE' : 'ANON');
export const supabaseAdmin = createClient(supabaseUrl, adminKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('✅ Supabase clients initialized:');
console.log(`   - Regular client: Using anon key`);
console.log(`   - Admin client: Using ${supabaseSecretKey ? 'secret key' : supabaseServiceKey ? 'service role key' : 'anon key (fallback)'}`);

// Use direct Supabase client for all operations
console.log('✅ Supabase client initialized for direct API calls');

// Export Supabase client as db for compatibility
export const db = supabase;
export const sql = null;
export { schema };
