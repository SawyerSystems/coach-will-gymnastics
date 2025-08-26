// Direct test of Resend API
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

async function testResendApi() {
  console.log('🚀 Testing direct email send via Resend API');
  
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
    
    console.log('📤 Attempting to send a test email...');
    const result = await resend.emails.send({
      from: 'Coach Will Tumbles <noreply@coachwilltumbles.com>',
      to: adminEmail,
      subject: '🧪 Admin Email Test',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h1 style="color: #0066cc;">Admin Email Test</h1>
          <p>This is a test email to verify that the Resend API is working correctly.</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
          <p>If you received this email, the admin notification system is working!</p>
        </div>
      `,
    });
    
    console.log('✅ Email sent successfully!');
    console.log('📊 Response:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    if (error.response) {
      console.error('Response error details:', error.response);
    }
    throw error;
  }
}

testResendApi().catch(err => {
  console.error('❌ Test failed with error:', err.message);
  process.exit(1);
});
