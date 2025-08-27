#!/usr/bin/env node

import dotenv from 'dotenv';
import { sendEmail } from './server/lib/email.ts';

// Load environment variables
dotenv.config();

async function testManualEmailSend() {
  console.log('🧪 Testing manual email send for booking #234...\n');

  try {
    // Test sending a simple admin notification email
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@coachwilltumbles.com';
    
    const emailData = {
      bookingId: '234',
      parentName: 'Will Webb',
      parentEmail: 'will@sawyerss.com',
      parentPhone: '2222222222',
      athleteNames: ['Test Athlete'],
      sessionDate: 'August 30, 2025',
      sessionTime: '12:00 PM',
      lessonType: 'Private Lesson',
      paymentStatus: 'reservation-paid',
      totalAmount: '$120',
      specialRequests: 'Back handspring and back tuck',
      adminPanelLink: 'http://localhost:5173/admin/bookings/234'
    };
    
    console.log('📧 Sending admin new booking email...');
    console.log(`   To: ${adminEmail}`);
    console.log(`   Data:`, JSON.stringify(emailData, null, 2));
    
    const result = await sendEmail({
      type: 'admin-new-booking',
      to: adminEmail,
      data: emailData
    });
    
    console.log('✅ Admin email sent successfully!');
    console.log('   Result:', result);
    
    // Now test the parent confirmation email
    console.log('\n📧 Sending parent confirmation email...');
    const parentResult = await sendEmail({
      type: 'session-confirmation',
      to: 'will@sawyerss.com',
      data: {
        parentName: 'Will Webb',
        athleteName: 'Test Athlete',
        sessionDate: 'Friday, August 30, 2025',
        sessionTime: '12:00 PM',
        athleteGender: 'female',
        manageLink: 'http://localhost:5173/parent/bookings/234'
      }
    });
    
    console.log('✅ Parent confirmation email sent successfully!');
    console.log('   Result:', parentResult);
    
  } catch (error) {
    console.error('❌ Email test failed:', error);
    console.error('   Stack:', error.stack);
  }
}

testManualEmailSend().catch(console.error);
