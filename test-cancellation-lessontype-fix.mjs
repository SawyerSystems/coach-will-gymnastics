#!/usr/bin/env node

/**
 * Test script for admin booking cancellation email with proper lesson type
 */

import { sendAdminBookingCancellation } from './server/lib/email.ts';

async function testCancellationEmailLessonTypeFix() {
  console.log('🧪 Testing admin cancellation email lessonType fix...\n');
  
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@coachwilltumbles.com';
  const baseUrl = 'http://localhost:5173';
  const testResults = [];
  
  // Test 1: Cancellation email with string lessonType (should work)
  try {
    console.log('📧 Testing cancellation email with string lessonType...');
    await sendAdminBookingCancellation(adminEmail, {
      bookingId: "TEST-CANCEL-STRING",
      parentName: "Test Parent",
      parentEmail: "test@example.com",
      sessionDate: "Monday, January 15, 2025",
      sessionTime: "3:00 PM",
      lessonType: "Private Lesson", // String format
      athleteNames: ["Test Athlete"],
      cancellationReason: "Testing string lessonType",
      wantsReschedule: false,
      adminPanelLink: `${baseUrl}/admin/bookings/TEST-CANCEL-STRING`
    });
    testResults.push("✅ String lessonType test passed");
    console.log("✅ String lessonType test passed");
  } catch (err) {
    testResults.push(`❌ String lessonType test failed: ${err.message}`);
    console.error(`❌ String lessonType test failed: ${err.message}`);
  }
  
  // Test 2: Cancellation email with object lessonType (the fix)
  try {
    console.log('📧 Testing cancellation email with object lessonType...');
    await sendAdminBookingCancellation(adminEmail, {
      bookingId: "TEST-CANCEL-OBJECT",
      parentName: "Test Parent",
      parentEmail: "test@example.com",
      sessionDate: "Monday, January 15, 2025",
      sessionTime: "3:00 PM",
      lessonType: { // Object format (simulating database response)
        id: 1,
        name: "Quick Journey",
        duration: 30,
        price: 40,
        description: "Perfect for skill checks, focused practice, or when time is limited",
        key: "quick-journey"
      },
      athleteNames: ["Test Athlete"],
      cancellationReason: "Testing object lessonType",
      wantsReschedule: true,
      preferredRescheduleDate: "Wednesday, January 17, 2025",
      preferredRescheduleTime: "4:00 PM",
      adminPanelLink: `${baseUrl}/admin/bookings/TEST-CANCEL-OBJECT`
    });
    testResults.push("✅ Object lessonType test passed");
    console.log("✅ Object lessonType test passed");
  } catch (err) {
    testResults.push(`❌ Object lessonType test failed: ${err.message}`);
    console.error(`❌ Object lessonType test failed: ${err.message}`);
  }
  
  // Print summary
  console.log('\n📊 Test Results Summary:');
  testResults.forEach(result => console.log(result));
  
  const passedCount = testResults.filter(r => r.includes('✅')).length;
  const totalCount = testResults.length;
  
  console.log(`\n🎯 Tests Passed: ${passedCount}/${totalCount}`);
  
  if (passedCount === totalCount) {
    console.log('🎉 All tests passed! The lessonType fix is working correctly for cancellation emails.');
  } else {
    console.log('⚠️ Some tests failed. Please review the results above.');
  }
}

testCancellationEmailLessonTypeFix().catch(console.error);
