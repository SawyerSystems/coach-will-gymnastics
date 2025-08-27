#!/usr/bin/env node

import { Resend } from 'resend';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testEmailConfiguration() {
  console.log('🔍 Testing Email Configuration...\n');
  
  // Check environment variables
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL;
  const adminEmail = process.env.ADMIN_EMAIL;
  
  console.log('📋 Environment Variables Check:');
  console.log(`   RESEND_API_KEY: ${resendApiKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`   FROM_EMAIL: ${fromEmail || 'Not set'}`);
  console.log(`   ADMIN_EMAIL: ${adminEmail || 'Not set'}\n`);
  
  if (!resendApiKey) {
    console.error('❌ RESEND_API_KEY is required but not found in environment variables');
    process.exit(1);
  }
  
  // Initialize Resend
  const resend = new Resend(resendApiKey);
  
  console.log('🔑 Testing Resend API Key...');
  
  try {
    // Test API key validity by fetching domains (lightweight operation)
    const domains = await resend.domains.list();
    console.log('✅ Resend API key is valid');
    console.log(`📍 Domains configured: ${domains.data?.length || 0}`);
    
    if (domains.data && domains.data.length > 0) {
      console.log('   Domains:', domains.data.map(d => d.name).join(', '));
    }
  } catch (error) {
    console.error('❌ Resend API key test failed:', error.message);
    return;
  }
  
  console.log('\n📧 Testing Simple Email Send...');
  
  try {
    const testResult = await resend.emails.send({
      from: 'Coach Will Tumbles <noreply@coachwilltumbles.com>',
      to: adminEmail || 'admin@coachwilltumbles.com',
      subject: '🧪 Email System Test - Coach Will Tumbles',
      html: `
        <h2>Email System Diagnostic Test</h2>
        <p>This is a test email to verify the email system is working correctly.</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <p><strong>Test Type:</strong> Email configuration diagnostic</p>
        <hr>
        <p><em>Coach Will Tumbles Email System</em></p>
      `
    });
    
    console.log('✅ Test email sent successfully!');
    console.log(`   Email ID: ${testResult.data?.id}`);
    console.log(`   To: ${adminEmail || 'admin@coachwilltumbles.com'}`);
    
  } catch (error) {
    console.error('❌ Test email failed:', error.message);
    if (error.message.includes('DNS')) {
      console.log('\n💡 DNS Error Troubleshooting:');
      console.log('   - Check if your domain is properly verified in Resend');
      console.log('   - Ensure DNS records are correctly configured');
      console.log('   - Try using a verified sender address');
    }
  }
  
  console.log('\n🏁 Email diagnostic test completed');
}

testEmailConfiguration().catch(console.error);
