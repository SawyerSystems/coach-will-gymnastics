// Admin notification diagnostic test
// Run with: NODE_OPTIONS=--experimental-vm-modules npx tsx admin-email-diagnosis.tsx

import dotenv from 'dotenv';
import { sendAdminNewParent, sendAdminNewAthlete } from './server/lib/email';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runDiagnostics() {
  console.log('🔍 Admin Email Notification Diagnostic Tool');
  console.log('==========================================');
  
  // Check environment variables
  console.log('\n📋 Environment Variable Check:');
  console.log(`- RESEND_API_KEY: ${process.env.RESEND_API_KEY ? '✅ Set' : '❌ Not set'}`);
  console.log(`- ADMIN_EMAIL: ${process.env.ADMIN_EMAIL ? `✅ Set (${process.env.ADMIN_EMAIL})` : '❌ Not set (using default: admin@coachwilltumbles.com)'}`);
  console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
  
  // Check if email templates exist
  console.log('\n📧 Email Template Check:');
  const emailsDir = path.join(__dirname, 'emails');
  const adminTemplates = [
    { name: 'AdminNewParent.tsx', path: path.join(emailsDir, 'AdminNewParent.tsx') },
    { name: 'AdminNewAthlete.tsx', path: path.join(emailsDir, 'AdminNewAthlete.tsx') }
  ];

  adminTemplates.forEach(template => {
    if (fs.existsSync(template.path)) {
      console.log(`✅ ${template.name} exists`);
    } else {
      console.log(`❌ ${template.name} is missing`);
    }
  });
  
  // Get admin email address from environment or use default
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@coachwilltumbles.com';
  
  // Run the tests
  console.log('\n🧪 Testing Admin Notification Emails:');
  
  // Test 1: New Parent Notification
  console.log('\n📤 Testing AdminNewParent email...');
  try {
    const baseUrl = 'http://localhost:5173'; // Default development URL
    
    const result = await sendAdminNewParent(adminEmail, {
      parentId: "TEST-PARENT-ID",
      parentName: "Test Parent (Diagnostic)",
      parentEmail: "test.parent@example.com",
      parentPhone: "(555) 123-4567",
      registrationDate: new Date().toISOString(),
      athletes: [
        { id: "TEST-ATHLETE-001", name: "Test Child 1", age: 8 },
        { id: "TEST-ATHLETE-002", name: "Test Child 2", age: 10 }
      ],
      adminPanelLink: `${baseUrl}/admin/parents/TEST-PARENT-ID`
    });
    
    console.log('✅ AdminNewParent email sent successfully!');
    console.log('📊 Result ID:', result?.data?.id || 'Unknown');
  } catch (error) {
    console.error('❌ AdminNewParent email failed:', error.message);
    console.error('Error details:', error);
  }
  
  // Test 2: New Athlete Notification
  console.log('\n📤 Testing AdminNewAthlete email...');
  try {
    const baseUrl = 'http://localhost:5173'; // Default development URL
    
    const result = await sendAdminNewAthlete(adminEmail, {
      athleteId: "TEST-ATHLETE-ID",
      athleteName: "Test Athlete (Diagnostic)",
      athleteAge: 9,
      athleteGender: "Female",
      athleteExperience: "Beginner",
      parentName: "Test Parent",
      parentEmail: "test.parent@example.com",
      parentPhone: "(555) 123-4567",
      registrationDate: new Date().toISOString(),
      waiverStatus: "signed",
      adminPanelLink: `${baseUrl}/admin/athletes/TEST-ATHLETE-ID`
    });
    
    console.log('✅ AdminNewAthlete email sent successfully!');
    console.log('📊 Result ID:', result?.data?.id || 'Unknown');
  } catch (error) {
    console.error('❌ AdminNewAthlete email failed:', error.message);
    console.error('Error details:', error);
  }
  
  console.log('\n🏁 Diagnostics complete!');
}

runDiagnostics().catch(error => {
  console.error('❌ Diagnostic failed with error:', error);
});
