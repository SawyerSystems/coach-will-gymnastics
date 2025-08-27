// A simple script to test the session confirmation email
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { promises as fs } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

// We need to dynamically import the email module since it uses CommonJS
const importEmail = async () => {
  // Create a temporary CJS wrapper file
  const wrapperPath = `${__dirname}/temp-email-wrapper.cjs`;
  await fs.writeFile(wrapperPath, `
    const { sendSessionConfirmation } = require('./server/lib/email');
    module.exports = { sendSessionConfirmation };
  `);
  
  try {
    // Import via dynamic import which can handle CJS modules
    const emailModule = await import(`./temp-email-wrapper.cjs`);
    return emailModule;
  } finally {
    // Clean up temporary file
    try {
      await fs.unlink(wrapperPath);
    } catch (e) {
      console.error('Failed to remove temp file:', e);
    }
  }
};

async function testEmailLogo() {
  try {
    console.log('Testing session confirmation email with logo...');
    const { sendSessionConfirmation } = await importEmail();
    
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
