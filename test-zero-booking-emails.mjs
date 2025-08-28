#!/usr/bin/env node

import dotenv from 'dotenv';
import { Resend } from 'resend';

// Load environment variables
dotenv.config();

// Create direct Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

async function testZeroBookingEmails() {
  console.log('🧪 Testing $0 booking email notifications...\n');

  // Print environment variables for debugging
  console.log('📋 Environment variables:');
  console.log(`   ADMIN_EMAIL: ${process.env.ADMIN_EMAIL || 'NOT SET'}`);
  console.log(`   RESEND_API_KEY present: ${Boolean(process.env.RESEND_API_KEY)}`);
  console.log(`   FROM_EMAIL: ${process.env.FROM_EMAIL || 'NOT SET'}\n`);

  // Create dummy booking data
  const bookingId = '999-test';
  const parentEmail = 'will@sawyerss.com'; // Use a real email for testing
  
  try {
    // 1. Test admin email for $0 booking
    console.log('📧 Testing admin email for $0 booking...');
    
    // Get admin email from environment, falling back to default
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@coachwilltumbles.com';
    console.log(`   Using admin email address: ${adminEmail}`);
    
    // Construct email data similar to actual $0 booking
    const adminEmailData = {
      bookingId,
      parentName: 'Test Parent',
      parentEmail,
      parentPhone: '555-123-4567',
      athleteNames: ['Test Athlete 1', 'Test Athlete 2'],
      sessionDate: 'Friday, August 30, 2025',
      sessionTime: '3:00 PM',
      lessonType: 'Private Lesson',
      paymentStatus: 'reservation-paid',
      totalAmount: '$0',
      specialRequests: 'Test $0 booking email notification',
      adminPanelLink: `http://localhost:5173/admin/bookings/${bookingId}`
    };
    
    // Send admin notification directly with Resend
    const adminResult = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'coach@coachwilltumbles.com',
      to: adminEmail,
      subject: `New Booking Alert: ${adminEmailData.lessonType} on ${adminEmailData.sessionDate}`,
      html: `
        <h1>New Booking Alert</h1>
        <p>A new $0 reservation booking has been created:</p>
        <ul>
          <li><strong>Booking ID:</strong> ${adminEmailData.bookingId}</li>
          <li><strong>Parent:</strong> ${adminEmailData.parentName} (${adminEmailData.parentEmail})</li>
          <li><strong>Athletes:</strong> ${adminEmailData.athleteNames.join(', ')}</li>
          <li><strong>Session:</strong> ${adminEmailData.lessonType} on ${adminEmailData.sessionDate} at ${adminEmailData.sessionTime}</li>
          <li><strong>Amount:</strong> ${adminEmailData.totalAmount}</li>
          <li><strong>Special Requests:</strong> ${adminEmailData.specialRequests || 'None'}</li>
        </ul>
        <p><a href="${adminEmailData.adminPanelLink}">View in Admin Panel</a></p>
        <p>This is a test email to verify admin notifications for $0 bookings.</p>
      `
    });
    
    console.log('✅ Admin email sent successfully!');
    console.log('   Result:', adminResult);
    
    // 2. Test parent confirmation email
    console.log('\n📧 Testing parent confirmation email...');
    
    const parentEmailData = {
      parentName: 'Test Parent',
      athleteName: 'Test Athlete 1',
      sessionDate: 'Friday, August 30, 2025',
      sessionTime: '3:00 PM',
      athleteGender: 'male',
      manageLink: `http://localhost:5173/parent/bookings/${bookingId}`
    };
    
    const parentResult = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'coach@coachwilltumbles.com',
      to: parentEmail,
      subject: `Booking Confirmation: ${parentEmailData.sessionDate} at ${parentEmailData.sessionTime}`,
      html: `
        <h1>Session Confirmed!</h1>
        <p>Hello ${parentEmailData.parentName},</p>
        <p>Your session has been confirmed:</p>
        <ul>
          <li><strong>Athlete:</strong> ${parentEmailData.athleteName}</li>
          <li><strong>Date:</strong> ${parentEmailData.sessionDate}</li>
          <li><strong>Time:</strong> ${parentEmailData.sessionTime}</li>
        </ul>
        <p><a href="${parentEmailData.manageLink}">Manage Your Booking</a></p>
        <p>This is a test email to verify parent notifications for $0 bookings.</p>
      `
    });
    
    console.log('✅ Parent confirmation email sent successfully!');
    console.log('   Result:', parentResult);
    
    // Summary
    console.log('\n✅✅ Email test complete! If both emails above show successful results,');
    console.log('   the email system is working correctly for $0 bookings.');
    console.log('\n📝 Remember to verify:');
    console.log('   1. Admin received email at:', adminEmail);
    console.log('   2. Parent received email at:', parentEmail);
    
  } catch (error) {
    console.error('\n❌ Email test failed:', error);
    console.error('   Stack:', error.stack);
    process.exit(1);
  }
}

testZeroBookingEmails().catch(console.error);
