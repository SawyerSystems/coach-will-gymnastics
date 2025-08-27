#!/usr/bin/env node

// Test script to diagnose admin email sending issues
import { sendAdminNewParent, sendAdminNewAthlete } from './server/lib/email.ts';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testAdminEmails() {
  console.log('🔍 Diagnosing admin email sending issues...');
  
  // Get admin email from environment or use default
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@coachwilltumbles.com';
  console.log(`📧 Using admin email: ${adminEmail}`);
  
  // Display all environment variables that might be relevant to email sending
  console.log('\n🔑 Email-related environment variables:');
  console.log(`RESEND_API_KEY: ${process.env.RESEND_API_KEY ? '✅ Set' : '❌ Not set'}`);
  console.log(`ADMIN_EMAIL: ${process.env.ADMIN_EMAIL ? '✅ Set' : '❌ Not set'}`);
  
  try {
    // Test sending admin new parent email
    console.log('\n📤 Sending test admin new parent email...');
    await sendAdminNewParent(adminEmail, {
      parentId: "TEST-PARENT-DIAGNOSIS",
      parentName: "Test Parent",
      parentEmail: "test.parent@example.com",
      parentPhone: "(555) 123-4567",
      registrationDate: new Date().toISOString(),
      athletes: [
        { id: "TEST-A001", name: "Test Child", age: 8 }
      ],
      adminPanelLink: `http://localhost:5173/admin/parents/TEST-PARENT-DIAGNOSIS`
    });
    console.log('✅ Test parent email sent successfully!');
    
    // Test sending admin new athlete email
    console.log('\n📤 Sending test admin new athlete email...');
    await sendAdminNewAthlete(adminEmail, {
      athleteId: "TEST-ATHLETE-DIAGNOSIS",
      athleteName: "Test Athlete",
      athleteAge: 9,
      athleteGender: "Female",
      athleteExperience: "Beginner",
      parentName: "Test Parent",
      parentEmail: "test.parent@example.com",
      parentPhone: "(555) 123-4567",
      registrationDate: new Date().toISOString(),
      waiverStatus: "signed",
      adminPanelLink: `http://localhost:5173/admin/athletes/TEST-ATHLETE-DIAGNOSIS`
    });
    console.log('✅ Test athlete email sent successfully!');
    
    console.log('\n🎉 Both test emails sent successfully! Check your admin inbox.');
  } catch (error) {
    console.error('\n❌ Error sending test emails:', error);
    if (error.response) {
      console.error('Response error details:', error.response);
    }
  }
}

testAdminEmails().catch(console.error);
