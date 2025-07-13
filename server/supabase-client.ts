import { createClient } from '@supabase/supabase-js';
import * as schema from "@shared/schema";

const supabaseUrl = 'https://nwdgtdzrcyfmislilucy.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseKey) {
  throw new Error("SUPABASE_ANON_KEY must be set");
}

console.log('Initializing Supabase client...');

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Use direct Supabase client for all operations
console.log('✅ Supabase client initialized for direct API calls');

// Export Supabase client as db for compatibility
export const db = supabase;
export const sql = null;
export { schema };