#!/usr/bin/env node

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Simulate the admin email logic from server/routes.ts
function simulateAdminEmailLogic() {
  console.log('🔍 Admin Email Configuration Verification\n');
  console.log('Simulating $0 booking admin email logic from server/routes.ts:');
  
  // Get admin email from environment variable (same logic as in routes.ts)
  const adminEmail = process.env.ADMIN_EMAIL || '';
  console.log(`[CHECKOUT-ADMIN-DEBUG] 🔍 ADMIN_EMAIL environment variable: "${adminEmail}"`);
  
  // Check if admin email is empty and log appropriate message
  if (!adminEmail) {
    console.log(`[CHECKOUT-ADMIN-DEBUG] ❌ ADMIN_EMAIL is empty or not set. Using default: "admin@coachwilltumbles.com"`);
  }
  
  // Set final admin email with fallback
  const finalAdminEmail = adminEmail || 'admin@coachwilltumbles.com';
  console.log(`[CHECKOUT-ADMIN-DEBUG] Final admin email address: ${finalAdminEmail}`);
  
  // Summary
  console.log('\n📋 Configuration Summary:');
  console.log(`   1. ADMIN_EMAIL environment variable: ${adminEmail ? `"${adminEmail}"` : 'NOT SET'}`);
  console.log(`   2. Final admin email that would be used: ${finalAdminEmail}`);
  console.log(`   3. RESEND_API_KEY present: ${Boolean(process.env.RESEND_API_KEY)}`);
  
  // Recommendation
  console.log('\n📝 Recommendation:');
  if (!adminEmail) {
    console.log('   ❌ ADMIN_EMAIL is not set. Set it to the monitored admin inbox in production.');
  } else if (adminEmail === 'admin@coachwilltumbles.com') {
    console.log('   ⚠️  ADMIN_EMAIL is set to the default value. Ensure this inbox is monitored,');
    console.log('      or change it to a monitored admin inbox in production.');
  } else {
    console.log(`   ✅ ADMIN_EMAIL is set to "${adminEmail}". Ensure this inbox is monitored.`);
  }
}

// Run the simulation
simulateAdminEmailLogic();
