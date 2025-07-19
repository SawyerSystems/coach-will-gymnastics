import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import 'dotenv/config';

const supabaseUrl = 'https://nwdgtdzrcyfmislilucy.supabase.co';
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;

console.log('🔐 Testing Supabase Secret Key...');
console.log('URL:', supabaseUrl);
console.log('Anon key exists:', !!anonKey);
console.log('Service key exists:', !!serviceKey);
console.log('Secret key exists:', !!secretKey);

async function testSecretKey() {
  if (!secretKey) {
    console.log('❌ No secret key provided');
    return;
  }

  console.log('\n--- Testing Secret Key Client ---');
  
  const secretClient = createClient(supabaseUrl, secretKey);
  
  try {
    // Test reading from admins table
    const { data: adminCount, error: countError } = await secretClient
      .from('admins')
      .select('count');
      
    if (countError) {
      console.log('❌ Secret key read test failed:', countError.message);
    } else {
      console.log('✅ Secret key read test passed:', adminCount);
    }
    
    // Test creating an admin account
    const email = process.env.ADMIN_EMAIL || 'admin@coachwilltumbles.com';
    const password = process.env.ADMIN_PASSWORD || 'TumbleCoach2025!';
    const passwordHash = await bcrypt.hash(password, 10);
    
    console.log('\n--- Testing Admin Creation with Secret Key ---');
    
    // Check if admin already exists
    const { data: existingAdmin, error: checkError } = await secretClient
      .from('admins')
      .select('id, email')
      .eq('email', email)
      .single();
      
    if (checkError && checkError.code !== 'PGRST116') {
      console.log('❌ Error checking existing admin:', checkError.message);
      return;
    }
    
    if (existingAdmin) {
      console.log('✅ Admin already exists:', existingAdmin);
      
      // Update password to test write permissions
      const { data: updateData, error: updateError } = await secretClient
        .from('admins')
        .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
        .eq('email', email)
        .select();
        
      if (updateError) {
        console.log('❌ Secret key update test failed:', updateError.message);
      } else {
        console.log('✅ Secret key update test passed - admin password updated');
      }
    } else {
      // Create new admin
      const { data: createData, error: createError } = await secretClient
        .from('admins')
        .insert({
          email: email,
          password_hash: passwordHash,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
        
      if (createError) {
        console.log('❌ Secret key create test failed:', createError.message);
      } else {
        console.log('✅ Secret key create test passed - new admin created:', createData);
      }
    }
    
  } catch (error) {
    console.log('❌ Secret key test error:', error.message);
  }
}

testSecretKey();
