// A simple script to test the session confirmation email
require('dotenv').config();
const { sendSessionConfirmation } = require('./server/lib/email');

async function testEmailLogo() {
  try {
    console.log('Testing session confirmation email with logo...');
    const testEmail = process.env.TEST_EMAIL || 'will@sawyerss.com';
    await sendSessionConfirmation(
      testEmail,
      'Test Parent',
      'Test Athlete',
      'Monday, August 26, 2025',
      '3:30 PM'
    );
    console.log('✅ Test email sent successfully to', testEmail);
  } catch (error) {
    console.error('❌ Failed to send test email:', error);
    console.error(error.stack);
  }
}

testEmailLogo();
