#!/usr/bin/env npx tsx

import { config } from 'dotenv';
config(); // Load environment variables

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';

async function createAdminDirectly() {
  const email = 'admin@coachwilltumbles.com';
  const password = 'TumbleCoach2025!';
  
  console.log('🔧 Creating admin account directly with service role...');
  console.log('📧 Email:', email);
  
  // Use service role key directly
  const supabaseUrl = 'https://nwdgtdzrcyfmislilucy.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found');
    return;
  }
  
  console.log('🔑 Using service role key for admin operations');
  
  // Create direct Supabase client with service role
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  try {
    // Check if admin already exists
    console.log('🔍 Checking for existing admin...');
    const { data: existingAdmins, error: checkError } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email);
    
    if (checkError) {
      console.error('❌ Error checking for existing admin:', checkError);
      return;
    }
    
    if (existingAdmins && existingAdmins.length > 0) {
      console.log('✅ Admin account already exists!');
      console.log('   ID:', existingAdmins[0].id);
      console.log('   Email:', existingAdmins[0].email);
      console.log('🚀 You can login at http://localhost:5173/admin/login');
      return;
    }
    
    // Create password hash
    console.log('🔐 Hashing password...');
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create admin account
    console.log('👤 Creating admin account...');
    const { data: admin, error: createError } = await supabase
      .from('admins')
      .insert({
        email,
        password_hash: passwordHash,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Error creating admin:', createError);
      return;
    }
    
    console.log('✅ Admin account created successfully!');
    console.log('   ID:', admin.id);
    console.log('   Email:', admin.email);
    console.log('🚀 You can now login at http://localhost:5173/admin/login');
    console.log('📝 Use these credentials:');
    console.log('   Email:', email);
    console.log('   Password:', password);
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
createAdminDirectly().catch(console.error);
