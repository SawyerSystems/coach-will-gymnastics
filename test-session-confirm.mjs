#!/usr/bin/env node

import dotenv from 'dotenv';
import { storage } from './server/storage.ts';
import { sendSessionConfirmationIfNeeded } from './server/lib/email.ts';

// Load environment variables
dotenv.config();

async function testSessionConfirmationForBooking234() {
  console.log('🧪 Testing sendSessionConfirmationIfNeeded for booking #234...\n');
  
  try {
    console.log('📋 Checking booking #234 details...');
    
    const booking = await storage.getBookingWithRelations(234);
    if (!booking) {
      console.error('❌ Booking #234 not found');
      return;
    }
    
    console.log(`   Payment Status: ${booking.paymentStatus}`);
    console.log(`   Session Confirmation Email Sent: ${booking.sessionConfirmationEmailSent}`);
    console.log(`   Parent Email: ${booking.parent?.email || booking.parentEmail || 'No email'}`);
    
    // Test the idempotent email function
    console.log('\n📧 Testing sendSessionConfirmationIfNeeded...');
    const result = await sendSessionConfirmationIfNeeded(234, storage);
    
    console.log(`   Result: ${result ? 'Email sent ✅' : 'Email not sent ❌'}`);
    
    // Check if the flag was updated
    const updatedBooking = await storage.getBooking(234);
    console.log(`   Updated flag: ${updatedBooking?.sessionConfirmationEmailSent}`);
    
  } catch (error) {
    console.error('❌ Error testing session confirmation:', error);
    console.error('   Stack:', error.stack);
  }
}

testSessionConfirmationForBooking234().catch(console.error);
