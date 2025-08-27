#!/usr/bin/env node

import dotenv from 'dotenv';
import { sendSessionConfirmationIfNeeded } from './server/lib/email.ts';
import { storage } from './server/storage.ts';

// Load environment variables
dotenv.config();

async function testSessionConfirmationFunction() {
  console.log('🧪 Testing sendSessionConfirmationIfNeeded for booking #234...\n');
  
  try {
    console.log('📧 Calling sendSessionConfirmationIfNeeded...');
    
    const result = await sendSessionConfirmationIfNeeded(234, storage);
    
    console.log(`✅ Function completed with result: ${result}`);
    
    if (result) {
      console.log('🎉 Confirmation email should have been sent!');
    } else {
      console.log('⚠️ Function returned false - email was not sent');
      console.log('   This could be because:');
      console.log('   - Email was already sent');
      console.log('   - Payment status doesn\'t qualify');
      console.log('   - Missing parent email');
      console.log('   - Other validation failed');
    }
    
    // Check if the email sent flag was updated
    console.log('\n🔍 Checking if booking was updated...');
    const booking = await storage.getBooking(234);
    if (booking) {
      console.log(`   Email sent flag: ${booking.sessionConfirmationEmailSent}`);
      console.log(`   Email sent at: ${booking.sessionConfirmationEmailSentAt || 'Not set'}`);
    }
    
  } catch (error) {
    console.error('❌ Function test failed:', error);
    console.error('   Stack:', error.stack);
  }
}

testSessionConfirmationFunction().catch(console.error);
