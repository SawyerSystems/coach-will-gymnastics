import { createFirstAdmin } from './auth.js';
import { storage } from './storage.js';

async function ensureAdmin() {
  // Use environment variables if available, fallback to defaults
  const email = process.env.ADMIN_EMAIL || 'admin@coachwilltumbles.com';
  const password = process.env.ADMIN_PASSWORD || 'TumbleCoach2025!';
  
  try {
    console.log('🔍 Checking for existing admin accounts...');
    
    // Check for existing admins
    const existingAdmins = await storage.getAllAdmins();
    
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
    
    await createFirstAdmin(email, password);
    
    console.log('✅ Admin account created successfully!');
    console.log('🚀 You can now login at /admin/login');
    
  } catch (error) {
    console.error('❌ Error managing admin account:', error);
    // Don't exit when called from server startup
    if (import.meta.url === `file://${process.argv[1]}`) {
      process.exit(1);
    }
    throw error;
  }
  
  // Only exit if run directly as a script
  if (import.meta.url === `file://${process.argv[1]}`) {
    process.exit(0);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  ensureAdmin();
}

export { ensureAdmin };
