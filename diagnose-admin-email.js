// Basic email diagnostic script
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Admin Email Diagnostic Tool');
console.log('=============================');

// Check environment variables
console.log('\n📋 Environment Variable Check:');
const requiredEnvVars = {
  'RESEND_API_KEY': process.env.RESEND_API_KEY ? '✅ Set' : '❌ Not set',
  'ADMIN_EMAIL': process.env.ADMIN_EMAIL ? `✅ Set (${process.env.ADMIN_EMAIL})` : '❌ Not set (using default: admin@coachwilltumbles.com)',
  'NODE_ENV': process.env.NODE_ENV || 'not set'
};

Object.entries(requiredEnvVars).forEach(([key, value]) => {
  console.log(`${key}: ${value}`);
});

// Check if email templates exist
console.log('\n📧 Email Template Check:');
const emailsDir = path.join(__dirname, 'emails');
const adminTemplates = [
  'AdminNewParent.tsx',
  'AdminNewAthlete.tsx',
  'AdminNewBooking.tsx',
  'AdminBookingCancellation.tsx',
  'AdminBookingReschedule.tsx',
  'AdminWaiverSigned.tsx'
];

const templateExists = {};
adminTemplates.forEach(template => {
  const templatePath = path.join(emailsDir, template);
  if (fs.existsSync(templatePath)) {
    templateExists[template] = true;
    console.log(`✅ ${template} exists`);
  } else {
    templateExists[template] = false;
    console.log(`❌ ${template} is missing`);
  }
});

// Check if Resend API key is working
console.log('\n🔑 Testing Resend API Connection:');
const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  console.log('❌ No RESEND_API_KEY found in environment variables');
} else {
  const options = {
    hostname: 'api.resend.com',
    path: '/api/keys/current',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  };

  const req = https.request(options, res => {
    console.log(`🌐 API Response Status: ${res.statusCode}`);
    
    if (res.statusCode === 200) {
      console.log('✅ Resend API key is valid');
    } else {
      console.log(`❌ Resend API key check failed with status: ${res.statusCode}`);
    }
    
    res.on('data', data => {
      try {
        const response = JSON.parse(data.toString());
        console.log('📊 API Response Data:', JSON.stringify(response, null, 2));
      } catch (err) {
        console.log('⚠️ Could not parse API response');
        console.log('Raw data:', data.toString());
      }
    });
  });

  req.on('error', error => {
    console.error('❌ Error connecting to Resend API:', error.message);
  });

  req.end();
}

// Look for logs with admin email failures
console.log('\n🔎 Searching for admin email failure logs:');
const adminEmailFailurePattern = /Failed to send admin.*notification/i;

try {
  // For local development with log files
  const logFiles = ['server.log', 'app.log', 'error.log'].filter(file => 
    fs.existsSync(path.join(__dirname, file))
  );
  
  if (logFiles.length) {
    logFiles.forEach(logFile => {
      try {
        const logPath = path.join(__dirname, logFile);
        const logs = fs.readFileSync(logPath, 'utf8');
        const lines = logs.split('\n');
        const failures = lines.filter(line => adminEmailFailurePattern.test(line));
        
        if (failures.length) {
          console.log(`Found ${failures.length} admin email failure logs in ${logFile}:`);
          failures.slice(-5).forEach(failure => console.log(`- ${failure}`));
        } else {
          console.log(`✅ No admin email failures found in ${logFile}`);
        }
      } catch (err) {
        console.log(`⚠️ Could not read log file ${logFile}: ${err.message}`);
      }
    });
  } else {
    console.log('⚠️ No log files found for analysis');
  }
} catch (err) {
  console.log('⚠️ Error searching for log files:', err.message);
}

console.log('\n📝 Recommendations:');
console.log('1. Ensure RESEND_API_KEY is correctly set in your environment');
console.log('2. Verify ADMIN_EMAIL is set to the correct email address');
console.log('3. Check if there are any network restrictions preventing email sending');
console.log('4. Inspect server logs for more detailed error messages');
console.log('5. Try running the test-admin-emails.js script with proper environment variables');
