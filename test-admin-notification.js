// Test specific admin notification functionality
import { Resend } from 'resend';
import React from 'react';
import { render } from '@react-email/render';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testAdminNotification() {
  console.log('🧪 Testing admin notification emails');
  
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.error('❌ RESEND_API_KEY not found in environment variables');
    return;
  }
  
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@coachwilltumbles.com';
  console.log(`📧 Using admin email: ${adminEmail}`);
  
  try {
    console.log('🔌 Initializing Resend with API key');
    const resend = new Resend(resendApiKey);
    
    // Dynamically import the admin notification email templates
    console.log('📧 Loading AdminNewParent template...');
    const AdminNewParentTemplate = (await import('./emails/AdminNewParent')).default;
    
    // Prepare test data
    const parentData = {
      parentId: "TEST-PARENT-123",
      parentName: "Test Parent",
      parentEmail: "test.parent@example.com",
      parentPhone: "(555) 123-4567",
      registrationDate: new Date().toISOString(),
      athletes: [
        { id: "TEST-ATHLETE-001", name: "Test Child", age: 8 }
      ],
      adminPanelLink: "http://localhost:5173/admin/parents/TEST-PARENT-123"
    };
    
    // Render the email template
    console.log('🔧 Rendering AdminNewParent template...');
    const html = render(React.createElement(AdminNewParentTemplate, parentData));
    
    // Send the email
    console.log('📤 Sending AdminNewParent test email...');
    const result = await resend.emails.send({
      from: 'Coach Will Tumbles <noreply@coachwilltumbles.com>',
      to: adminEmail,
      subject: '👋 New Parent Registration (TEST)',
      html,
    });
    
    console.log('✅ Admin notification email sent successfully!');
    console.log('📊 Response:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('❌ Failed to send admin notification email:', error);
    if (error.response) {
      console.error('Response error details:', error.response);
    }
    throw error;
  }
}

testAdminNotification().catch(err => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
