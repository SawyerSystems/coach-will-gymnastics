import { createFirstAdmin } from './auth.js';
import { createAdminViaAPI } from './create-admin-workaround.js';
import { storage } from './storage.js';

async function ensureAdmin() {
  // Use environment variables if available, fallback to defaults
  const email = process.env.ADMIN_EMAIL || 'admin@coachwilltumbles.com';
  const password = process.env.ADMIN_PASSWORD || 'TumbleCoach2025!';
  
  try {
    console.log('🔍 Checking for existing admin accounts...');
    
    // Check for existing admins with error handling
    let existingAdmins;
    try {
      existingAdmins = await storage.getAllAdmins();
    } catch (schemaError: any) {
      console.log('⚠️  Schema error when checking admins:', schemaError?.message || schemaError);
      if (schemaError?.message?.includes('updated_at') || schemaError?.message?.includes('created_at')) {
        console.log('🔧 Database schema needs to be updated. Please run fix-production-schema.sql');
        console.log('✅ Admin account check completed (schema update required)');
        return;
      }
      console.log('❌ Admin check failed due to schema error - continuing with server startup');
      console.log('✅ Admin account check completed (schema error - manual setup required)');
      return;
    }
    
    if (existingAdmins && existingAdmins.length > 0) {
      console.log('✅ Admin account(s) already exist:');
      existingAdmins.forEach((admin, index) => {
        console.log(`  ${index + 1}. ID: ${admin.id}, Email: ${admin.email}`);
      });
      console.log(`📊 Total admin accounts: ${existingAdmins.length}`);
      return;
    }
    
    console.log('🔧 No admin accounts found. Creating first admin...');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password.replace(/./g, '*')}`); // Hide password in logs
    
    // Try the standard method first (uses service role key)
    try {
      await createFirstAdmin(email, password);
      console.log('✅ Admin account created successfully!');
      console.log('🚀 You can now login at /admin/login');
      return;
    } catch (serviceRoleError) {
      console.log('⚠️  Service role method failed, trying API workaround...');
      
      // Try the API workaround method
      try {
        await createAdminViaAPI();
        console.log('✅ Admin account created via API workaround!');
        console.log('🚀 You can now login at /admin/login');
        return;
      } catch (apiError) {
        console.log('⚠️  API workaround also failed');
        console.log('❌ All admin creation methods failed - continuing with server startup');
        console.log('✅ Admin account check completed (manual setup required)');
        return;
      }
    }
    
  } catch (error) {
    console.log('❌ All admin creation methods failed');
    console.log('📋 MANUAL SETUP REQUIRED:');
    console.log('   1. Go to Supabase SQL Editor');
    console.log('   2. Run: node manual-admin-setup.js');
    console.log('   3. Copy and paste the generated SQL commands');
    console.log('   4. Restart the server');
    console.error('Final error:', error instanceof Error ? error.message : String(error));
    
    // Continue with server startup instead of failing
    console.log('✅ Admin account check completed (manual setup required)');
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  ensureAdmin();
}

export { ensureAdmin };
