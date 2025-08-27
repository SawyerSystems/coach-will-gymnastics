#!/usr/bin/env node

import dotenv from 'dotenv';
import { sendEmail } from './server/lib/email.ts';

// Load environment variables
dotenv.config();

async function sendMissingBookingEmails() {
  console.log('🔧 Sending missing booking confirmation emails...\n');
  
  try {
    // Test emails for booking #234 first
    const bookingId = 234;
    const parentEmail = 'sawyerwilliamf@yahoo.com';
    const parentName = 'Sawyer Williams';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@coachwilltumbles.com';
    
    console.log(`📧 Sending confirmation email for booking #${bookingId}...`);
    
    // Send parent confirmation email
    try {
      const parentResult = await sendEmail({
        type: 'session-confirmation',
        to: parentEmail,
        data: {
          parentName: parentName,
          athleteName: 'Test Athlete',
          sessionDate: 'Friday, August 30, 2025',
          sessionTime: '12:00 PM',
          athleteGender: 'other',
          manageLink: `http://localhost:5173/parent/bookings/${bookingId}`
        }
      });
      
      console.log(`✅ Parent confirmation email sent to ${parentEmail}`);
      console.log(`   Email ID: ${parentResult?.data?.id}`);
    } catch (parentError) {
      console.error(`❌ Failed to send parent email:`, parentError);
    }
    
    // Send admin notification email
    try {
      const adminResult = await sendEmail({
        type: 'admin-new-booking',
        to: adminEmail,
        data: {
          bookingId: bookingId.toString(),
          parentName: parentName,
          parentEmail: parentEmail,
          parentPhone: '(123) 456-7890',
          athleteNames: ['Test Athlete'],
          sessionDate: 'Friday, August 30, 2025',
          sessionTime: '12:00 PM',
          lessonType: 'Private Lesson',
          paymentStatus: 'reservation-paid',
          totalAmount: '0',
          specialRequests: 'Back handspring and back tuck',
          adminPanelLink: `http://localhost:5173/admin/bookings/${bookingId}`
        }
      });
      
      console.log(`✅ Admin notification email sent to ${adminEmail}`);
      console.log(`   Email ID: ${adminResult?.data?.id}`);
    } catch (adminError) {
      console.error(`❌ Failed to send admin email:`, adminError);
    }
    
    console.log('\n🎉 Manual email sending completed!');
    console.log('\n💡 To fix this permanently, we need to:');
    console.log('   1. Fix the $0 booking email logic in server/routes.ts');
    console.log('   2. Add a background job to catch missed emails');
    console.log('   3. Ensure sendSessionConfirmationIfNeeded works for $0 bookings');
    
  } catch (error) {
    console.error('❌ Error sending emails:', error);
  }
}

sendMissingBookingEmails().catch(console.error);
