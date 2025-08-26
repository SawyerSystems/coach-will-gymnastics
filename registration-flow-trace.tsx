// Test script to trace parent and athlete registration flow
// Run with: npx tsx registration-flow-trace.tsx

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Traces through the registration code flow to identify potential issues
 * with admin notification emails during registration.
 */
async function traceRegistrationFlow() {
  console.log('🔍 Registration Flow Trace Tool');
  console.log('==============================');
  
  // Check the server routes.ts file for parent registration logic
  console.log('\n📋 Checking parent registration code flow:');
  const routesPath = path.join(__dirname, 'server', 'routes.ts');
  
  if (fs.existsSync(routesPath)) {
    console.log('✅ Found routes.ts file');
    
    const routesContent = fs.readFileSync(routesPath, 'utf8');
    
    // Look for parent registration endpoint
    const parentRegEndpoint = routesContent.includes('/api/parents');
    console.log(`${parentRegEndpoint ? '✅' : '❌'} Parent registration endpoint found`);
    
    // Look for admin notification in parent registration
    const adminParentNotification = routesContent.includes('sendAdminNewParent');
    console.log(`${adminParentNotification ? '✅' : '❌'} Admin parent notification code found`);
    
    // Look for athlete registration endpoint
    const athleteRegEndpoint = routesContent.includes('/api/athletes');
    console.log(`${athleteRegEndpoint ? '✅' : '❌'} Athlete registration endpoint found`);
    
    // Look for admin notification in athlete registration
    const adminAthleteNotification = routesContent.includes('sendAdminNewAthlete');
    console.log(`${adminAthleteNotification ? '✅' : '❌'} Admin athlete notification code found`);
    
    // Check for sendAdminNewParent and try-catch pattern
    const sendAdminNewParentPattern = /try\s*{[^}]*sendAdminNewParent[^}]*}\s*catch\s*\(\s*adminEmailError\s*\)/s;
    const hasAdminParentEmailTryCatch = sendAdminNewParentPattern.test(routesContent);
    
    // Check for console.error for parent email failure
    const parentErrorLoggingPattern = /console\.error\([^)]*Failed to send admin new parent notification[^)]*\)/;
    const hasParentErrorLogging = parentErrorLoggingPattern.test(routesContent);
    
    // Check for sendAdminNewAthlete and try-catch pattern
    const sendAdminNewAthletePattern = /try\s*{[^}]*sendAdminNewAthlete[^}]*}\s*catch\s*\(\s*adminEmailError\s*\)/s;
    const hasAdminAthleteEmailTryCatch = sendAdminNewAthletePattern.test(routesContent);
    
    // Check for console.error for athlete email failure
    const athleteErrorLoggingPattern = /console\.error\([^)]*Failed to send admin new athlete notification[^)]*\)/;
    const hasAthleteErrorLogging = athleteErrorLoggingPattern.test(routesContent);
    
    console.log('\n📝 Parent Email Flow Analysis:');
    console.log(`${hasAdminParentEmailTryCatch ? '✅' : '❌'} Admin parent email wrapped in try-catch block`);
    console.log(`${hasParentErrorLogging ? '✅' : '❌'} Error logging for admin parent email failure exists`);
    
    console.log('\n📝 Athlete Email Flow Analysis:');
    console.log(`${hasAdminAthleteEmailTryCatch ? '✅' : '❌'} Admin athlete email wrapped in try-catch block`);
    console.log(`${hasAthleteErrorLogging ? '✅' : '❌'} Error logging for admin athlete email failure exists`);
    
    // Extract some context around the parent email send
    const parentEmailContext = extractSection(routesContent, 'sendAdminNewParent', '})', 1000);
    if (parentEmailContext) {
      console.log('\n📄 Parent Email Context Sample:');
      console.log(parentEmailContext.substring(0, 500) + '...');
    }
    
    // Extract some context around the athlete email send
    const athleteEmailContext = extractSection(routesContent, 'sendAdminNewAthlete', '})', 1000);
    if (athleteEmailContext) {
      console.log('\n📄 Athlete Email Context Sample:');
      console.log(athleteEmailContext.substring(0, 500) + '...');
    }
  } else {
    console.log('❌ routes.ts file not found');
  }
  
  console.log('\n🏁 Registration flow trace complete!');
  
  // Recommendations based on findings
  console.log('\n📋 Recommendations:');
  console.log('1. Check server logs for any "Failed to send admin notification" messages');
  console.log('2. Verify that the ADMIN_EMAIL environment variable is correctly set in production');
  console.log('3. Test the parent and athlete registration flows in the actual application');
  console.log('4. If issues persist, add more detailed error logging for email failures');
}

/**
 * Extracts a section of code between start and end patterns
 */
function extractSection(content, startPattern, endPattern, maxLength = 1000) {
  const startIndex = content.indexOf(startPattern);
  if (startIndex === -1) return null;
  
  const sectionContent = content.substring(startIndex, startIndex + maxLength);
  const endIndex = sectionContent.indexOf(endPattern);
  
  if (endIndex === -1) return sectionContent;
  return sectionContent.substring(0, endIndex + endPattern.length);
}

traceRegistrationFlow().catch(error => {
  console.error('❌ Trace failed with error:', error);
});
