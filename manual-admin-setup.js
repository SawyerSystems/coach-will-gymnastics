import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import 'dotenv/config';

const supabaseUrl = 'https://nwdgtdzrcyfmislilucy.supabase.co';
const anonKey = process.env.SUPABASE_ANON_KEY;

console.log('🔧 Creating admin account manually...');

// Since we can't use service role key for RLS bypass,
// we'll output the SQL commands needed to create the admin manually

async function generateAdminSQL() {
  const email = process.env.ADMIN_EMAIL || 'admin@coachwilltumbles.com';
  const password = process.env.ADMIN_PASSWORD || 'TumbleCoach2025!';
  
  // Hash the password
  const passwordHash = await bcrypt.hash(password, 10);
  
  console.log('\n=== MANUAL ADMIN CREATION INSTRUCTIONS ===');
  console.log('\n1. Go to your Supabase dashboard');
  console.log('2. Navigate to the SQL Editor');
  console.log('3. Execute the following SQL commands:\n');
  
  console.log('-- Temporarily disable RLS for admin creation');
  console.log('ALTER TABLE admins DISABLE ROW LEVEL SECURITY;');
  console.log('');
  console.log('-- Insert admin account');
  console.log(`INSERT INTO admins (email, password_hash, created_at, updated_at)`);
  console.log(`VALUES ('${email}', '${passwordHash}', NOW(), NOW())`);
  console.log(`ON CONFLICT (email) DO UPDATE SET`);
  console.log(`  password_hash = EXCLUDED.password_hash,`);
  console.log(`  updated_at = NOW();`);
  console.log('');
  console.log('-- Re-enable RLS');
  console.log('ALTER TABLE admins ENABLE ROW LEVEL SECURITY;');
  console.log('');
  console.log('-- Verify admin was created');
  console.log('SELECT id, email, created_at FROM admins;');
  console.log('\n=== END OF INSTRUCTIONS ===\n');
  
  // Also test if we can read from the admins table
  console.log('📊 Testing current admin table access...');
  
  const client = createClient(supabaseUrl, anonKey);
  
  try {
    const { data, error } = await client
      .from('admins')
      .select('id, email, created_at');
      
    if (error) {
      console.log('❌ Error reading admins table:', error.message);
    } else {
      console.log('✅ Current admins in database:', data);
      if (data.length === 0) {
        console.log('📝 No admin accounts found - please run the SQL above');
      } else {
        console.log('🎉 Admin accounts already exist!');
      }
    }
  } catch (err) {
    console.log('❌ Connection error:', err);
  }
}

generateAdminSQL();
