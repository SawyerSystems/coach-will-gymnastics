#!/usr/bin/env node

/**
 * Test script for admin booking reschedule email with proper lesson type
 */

import { sendAdminBookingReschedule } from './server/lib/email.ts';

async function testRescheduleEmail() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@coachwilltumbles.com';
  const baseUrl = 'http://localhost:5173';
  
  console.log('📧 Testing admin reschedule email with proper lesson type...');
  
  // Test with string lesson type
  await sendAdminBookingReschedule(adminEmail, {
    bookingId: "TEST-123",
    parentName: "Test Parent",
    parentEmail: "test@example.com",
    oldSessionDate: "2025-08-29",
    oldSessionTime: "14:30",
    newSessionDate: "2025-08-29",
    newSessionTime: "15:00",
    lessonType: "Private Gymnastics Lesson",
    athleteNames: ["Test Athlete"],
    adminPanelLink: `${baseUrl}/admin/bookings/TEST-123`
  });
  
  console.log('✅ Test completed. Check admin email for proper lesson type.');
}

testRescheduleEmail().catch(console.error);
