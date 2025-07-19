#!/usr/bin/env npx tsx

import { config } from 'dotenv';
config(); // Load environment variables

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';

async function resetAdminPassword() {
  const email = 'admin@coachwilltumbles.com';
  const newPassword = 'TumbleCoach2025!';
  
  console.log('🔧 Resetting admin password...');
  console.log('📧 Email:', email);
  console.log('🔑 New Password:', newPassword);
  
  // Use service role key directly
  const supabaseUrl = 'https://nwdgtdzrcyfmislilucy.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  try {
    // Hash the new password
    console.log('🔐 Hashing new password...');
    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    // Update admin password
    console.log('🔄 Updating admin password...');
    const { data: admin, error: updateError } = await supabase
      .from('admins')
      .update({
        password_hash: passwordHash
      })
      .eq('email', email)
      .select()
      .single();
    
    if (updateError) {
      console.error('❌ Error updating password:', updateError);
      return;
    }
    
    console.log('✅ Admin password updated successfully!');
    console.log('   ID:', admin.id);
    console.log('   Email:', admin.email);
    console.log('');
    console.log('🚀 You can now login at http://localhost:5173/admin/login');
    console.log('📝 Use these credentials:');
    console.log('   Email:', email);
    console.log('   Password:', newPassword);
    console.log('');
    console.log('💡 Try logging in now!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
resetAdminPassword().catch(console.error);
