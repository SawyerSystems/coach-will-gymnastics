#!/usr/bin/env node

import dotenv from 'dotenv';
import { storage } from './server/storage.ts';

// Load environment variables
dotenv.config();

async function checkRecentBookings() {
  console.log('🔍 Checking Recent Bookings and Email Status...\n');
  
  try {
    // Get all bookings
    const bookings = await storage.getAllBookings();
    
    // Sort by created date (most recent first)
    const recentBookings = bookings
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10); // Get last 10 bookings
    
    console.log(`📋 Found ${bookings.length} total bookings, showing latest 10:\n`);
    
    for (const booking of recentBookings) {
      console.log(`📅 Booking #${booking.id} (Created: ${booking.createdAt})`);
      console.log(`   Parent: ${booking.parentFirstName || 'Unknown'} ${booking.parentLastName || ''}`);
      console.log(`   Email: ${booking.parentEmail || 'No email'}`);
      console.log(`   Payment Status: ${booking.paymentStatus}`);
      console.log(`   Attendance: ${booking.attendanceStatus}`);
      console.log(`   Session Confirmation Email Sent: ${booking.sessionConfirmationEmailSent ? 'YES ✅' : 'NO ❌'}`);
      
      if (booking.sessionConfirmationEmailSentAt) {
        console.log(`   Email Sent At: ${booking.sessionConfirmationEmailSentAt}`);
      }
      
      console.log(`   Stripe Session ID: ${booking.stripeSessionId || 'None'}`);
      console.log(`   Preferred Date: ${booking.preferredDate || 'Not set'}`);
      console.log(`   Amount: $${booking.amount || '0'}`);
      console.log('   ---');
    }
    
    // Check for bookings that are paid but haven't received confirmation emails
    const paidBookingsWithoutEmails = bookings.filter(b => 
      (b.paymentStatus === 'reservation-paid' || b.paymentStatus === 'session-paid') &&
      !b.sessionConfirmationEmailSent
    );
    
    console.log(`\n🔍 Analysis:`);
    console.log(`   Total Bookings: ${bookings.length}`);
    console.log(`   Paid Bookings Without Confirmation Email: ${paidBookingsWithoutEmails.length}`);
    
    if (paidBookingsWithoutEmails.length > 0) {
      console.log('\n❌ Paid bookings missing confirmation emails:');
      for (const booking of paidBookingsWithoutEmails) {
        console.log(`   - Booking #${booking.id}: ${booking.parentEmail} (${booking.paymentStatus})`);
      }
    }
    
    // Check recent Stripe payments
    const stripeBookings = bookings.filter(b => b.stripeSessionId);
    console.log(`   Bookings with Stripe Session ID: ${stripeBookings.length}`);
    
  } catch (error) {
    console.error('❌ Error checking bookings:', error);
  }
}

checkRecentBookings().catch(console.error);
