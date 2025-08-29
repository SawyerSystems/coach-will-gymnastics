#!/usr/bin/env node

// Test script to verify the admin reschedule email lessonType fix
import { sendAdminBookingReschedule } from './server/lib/email.ts';

async function testRescheduleEmailLessonTypeFix() {
  console.log('🧪 Testing admin reschedule email lessonType fix...\n');
  
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@coachwilltumbles.com';
  const baseUrl = 'http://localhost:5173';
  const testResults = [];
  
  // Test 1: Reschedule email with string lessonType (should work)
  try {
    console.log('📧 Testing reschedule email with string lessonType...');
    await sendAdminBookingReschedule(adminEmail, {
      bookingId: "TEST-RESCHEDULE-STRING",
      parentName: "Test Parent",
      parentEmail: "test@example.com",
      oldSessionDate: "Monday, January 15, 2025",
      oldSessionTime: "3:00 PM",
      newSessionDate: "Tuesday, January 16, 2025",
      newSessionTime: "4:00 PM",
      lessonType: "Private Lesson", // String format
      athleteNames: ["Test Athlete"],
      rescheduleReason: "Testing string lessonType",
      adminPanelLink: `${baseUrl}/admin/bookings/TEST-RESCHEDULE-STRING`
    });
    testResults.push("✅ String lessonType test passed");
    console.log("✅ String lessonType test passed");
  } catch (err) {
    testResults.push(`❌ String lessonType test failed: ${err.message}`);
    console.error(`❌ String lessonType test failed: ${err.message}`);
  }
  
  // Test 2: Reschedule email with object lessonType (the fix)
  try {
    console.log('📧 Testing reschedule email with object lessonType...');
    await sendAdminBookingReschedule(adminEmail, {
      bookingId: "TEST-RESCHEDULE-OBJECT",
      parentName: "Test Parent",
      parentEmail: "test@example.com",
      oldSessionDate: "Monday, January 15, 2025",
      oldSessionTime: "3:00 PM",
      newSessionDate: "Tuesday, January 16, 2025",
      newSessionTime: "4:00 PM",
      lessonType: { // Object format (simulating database response)
        id: 1,
        name: "Quick Journey",
        duration: 30,
        price: 40,
        description: "Perfect for skill checks, focused practice, or when time is limited",
        key: "quick-journey"
      },
      athleteNames: ["Test Athlete"],
      rescheduleReason: "Testing object lessonType",
      adminPanelLink: `${baseUrl}/admin/bookings/TEST-RESCHEDULE-OBJECT`
    });
    testResults.push("✅ Object lessonType test passed");
    console.log("✅ Object lessonType test passed");
  } catch (err) {
    testResults.push(`❌ Object lessonType test failed: ${err.message}`);
    console.error(`❌ Object lessonType test failed: ${err.message}`);
  }
  
  // Summary
  console.log('\n📊 Test Results Summary:');
  testResults.forEach(result => console.log(result));
  
  const passedTests = testResults.filter(r => r.includes('✅')).length;
  const totalTests = testResults.length;
  
  console.log(`\n🎯 Tests Passed: ${passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! The lessonType fix is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the implementation.');
  }
}

// Run the test
testRescheduleEmailLessonTypeFix().catch(console.error);
