#!/usr/bin/env npx tsx

import { config } from 'dotenv';
config(); // Load environment variables

import bcrypt from 'bcrypt';
import { storage } from './server/storage.js';

async function createAdminAccount() {
  const email = 'admin@coachwilltumbles.com';
  const password = 'TumbleCoach2025!';
  
  console.log('🔧 Creating admin account...');
  console.log('📧 Email:', email);
  console.log('🔑 Password:', password.replace(/./g, '*'));
  
  try {
    // Check if admin already exists
    console.log('🔍 Checking for existing admin...');
    const existingAdmin = await storage.getAdminByEmail(email);
    
    if (existingAdmin) {
      console.log('✅ Admin account already exists!');
      console.log('   ID:', existingAdmin.id);
      console.log('   Email:', existingAdmin.email);
      console.log('🚀 You can login at http://localhost:5173/admin/login');
      return;
    }
    
    // Create password hash
    console.log('🔐 Hashing password...');
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create admin account
    console.log('👤 Creating admin account...');
    const admin = await storage.createAdmin({
      email,
      passwordHash
    });
    
    console.log('✅ Admin account created successfully!');
    console.log('   ID:', admin.id);
    console.log('   Email:', admin.email);
    console.log('🚀 You can now login at http://localhost:5173/admin/login');
    console.log('📝 Use these credentials:');
    console.log('   Email:', email);
    console.log('   Password:', password);
    
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    
    // If storage method fails, let's check what's happening
    if (error instanceof Error) {
      console.log('🔍 Error details:', error.message);
      
      // Try to get all admins to see if there's a database connection issue
      try {
        console.log('🔍 Testing database connection...');
        const allAdmins = await storage.getAllAdmins();
        console.log('📊 Current admin count:', allAdmins.length);
        if (allAdmins.length > 0) {
          console.log('📋 Existing admins:');
          allAdmins.forEach(admin => {
            console.log(`   - ID: ${admin.id}, Email: ${admin.email}`);
          });
        }
      } catch (dbError) {
        console.error('❌ Database connection error:', dbError);
      }
    }
  }
}

// Run the script
createAdminAccount().catch(console.error);
