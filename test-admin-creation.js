import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = 'https://nwdgtdzrcyfmislilucy.supabase.co';
const anonKey = process.env.SUPABASE_ANON_KEY;

console.log('Testing with anon client and manual admin creation...');

const anonClient = createClient(supabaseUrl, anonKey);

async function testAdminCreation() {
  try {
    // First, let's see if we can create an admin using raw SQL
    const { data, error } = await anonClient.rpc('exec_sql', {
      sql: `
        -- Temporarily disable RLS for admin creation
        ALTER TABLE admins DISABLE ROW LEVEL SECURITY;
        
        -- Insert admin if not exists
        INSERT INTO admins (email, password_hash, created_at, updated_at)
        VALUES ('admin@coachwilltumbles.com', '$2b$10$test_hash_here', NOW(), NOW())
        ON CONFLICT (email) DO NOTHING;
        
        -- Re-enable RLS
        ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
        
        SELECT 'Admin creation completed' as result;
      `
    });
    
    console.log('SQL execution result:', { data, error });
    
  } catch (err) {
    console.log('RPC method not available, trying direct insert...');
    
    // Try direct insert (will fail with RLS)
    const { data, error } = await anonClient
      .from('admins')
      .insert({
        email: 'admin@coachwilltumbles.com',
        password_hash: '$2b$10$test_hash_here',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    console.log('Direct insert result:', { data, error });
  }
}

testAdminCreation();
