import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import 'dotenv/config';

const supabaseUrl = 'https://nwdgtdzrcyfmislilucy.supabase.co';
const anonKey = process.env.SUPABASE_ANON_KEY;

if (!anonKey) {
  throw new Error("SUPABASE_ANON_KEY must be set");
}

// Create a special admin creation function that works around RLS
export async function createAdminViaAPI() {
  const email = process.env.ADMIN_EMAIL || 'admin@coachwilltumbles.com';
  const password = process.env.ADMIN_PASSWORD || 'TumbleCoach2025!';
  
  console.log('🔧 Attempting admin creation via API workaround...');
  
  const client = createClient(supabaseUrl, anonKey!);
  
  try {
    // First check if admin already exists
    const { data: existingAdmins, error: checkError } = await client
      .from('admins')
      .select('id, email')
      .eq('email', email);
      
    if (checkError) {
      throw new Error(`Failed to check existing admins: ${checkError.message}`);
    }
    
    if (existingAdmins && existingAdmins.length > 0) {
      console.log('✅ Admin already exists:', existingAdmins[0]);
      return existingAdmins[0];
    }
    
    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Try to create admin using a custom RPC function if it exists
    try {
      const { data, error } = await client.rpc('create_admin_account', {
        admin_email: email,
        admin_password_hash: passwordHash
      });
      
      if (!error && data) {
        console.log('✅ Admin created via RPC function');
        return data;
      }
    } catch (rpcError) {
      console.log('⚠️  RPC function not available, trying direct insert...');
    }
    
    // If RPC doesn't work, try direct insert (will likely fail with RLS)
    const adminData: any = {
      email: email,
      password_hash: passwordHash,
      created_at: new Date().toISOString()
    };
    
    // Only add updated_at if the column exists (production schema issue)
    try {
      // Test if updated_at column exists by attempting a select
      await client
        .from('admins')
        .select('updated_at')
        .limit(1);
      
      // If no error, the column exists, so we can include it
      adminData.updated_at = new Date().toISOString();
    } catch (schemaError) {
      console.log('⚠️  updated_at column not found, creating admin without it');
    }
    
    const { data, error } = await client
      .from('admins')
      .insert(adminData)
      .select()
      .single();
      
    if (error) {
      throw new Error(`Direct insert failed: ${error.message}`);
    }
    
    console.log('✅ Admin created successfully via direct insert');
    return data;
    
  } catch (error) {
    console.log('❌ Admin creation failed:', error instanceof Error ? error.message : String(error));
    console.log('📝 You need to create the admin manually using the SQL commands:');
    
    const passwordHash = await bcrypt.hash(password, 10);
    console.log('\n--- Copy and paste this SQL into Supabase SQL Editor ---');
    console.log('ALTER TABLE admins DISABLE ROW LEVEL SECURITY;');
    console.log(`INSERT INTO admins (email, password_hash, created_at)`);
    console.log(`VALUES ('${email}', '${passwordHash}', NOW())`);
    console.log(`ON CONFLICT (email) DO NOTHING;`);
    console.log('ALTER TABLE admins ENABLE ROW LEVEL SECURITY;');
    console.log('--- End of SQL commands ---\n');
    
    throw error;
  }
}

// If run directly, execute the function
if (import.meta.url === `file://${process.argv[1]}`) {
  createAdminViaAPI()
    .then(() => {
      console.log('Admin creation process completed');
      process.exit(0);
    })
    .catch(() => {
      console.log('Admin creation failed - manual intervention required');
      process.exit(1);
    });
}
