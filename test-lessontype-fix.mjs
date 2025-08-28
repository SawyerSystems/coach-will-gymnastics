// test-lessontype-fix.mjs
// Script to test the fix for lessonType format in admin emails

import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// Function to test admin email with different lessonType formats
async function testAdminEmailWithDifferentLessonTypes() {
  console.log('🧪 Testing admin email with different lessonType formats...');
  
  // Mock data with lessonType as object
  const objectData = {
    bookingId: "test-123",
    parentName: "Test Parent",
    parentEmail: "test@example.com",
    parentPhone: "555-123-4567",
    athleteNames: ["Athlete 1"],
    sessionDate: new Date().toISOString().split('T')[0],
    sessionTime: "13:00",
    lessonType: { id: 1, name: "Private Lesson", duration: 60, price: 80 },
    paymentStatus: "reservation-paid",
    totalAmount: "0",
    adminPanelLink: `${BASE_URL}/admin/bookings`
  };
  
  // Mock data with lessonType as string
  const stringData = {
    ...objectData,
    lessonType: "Private Lesson"
  };
  
  // Test object format
  console.log('Testing with lessonType as object...');
  const objectResult = await testEmailFormat(objectData);
  
  // Test string format
  console.log('Testing with lessonType as string...');
  const stringResult = await testEmailFormat(stringData);
  
  console.log('\n📊 Results Summary:');
  console.log(`Object format test: ${objectResult ? '✅ Passed' : '❌ Failed'}`);
  console.log(`String format test: ${stringResult ? '✅ Passed' : '❌ Failed'}`);
}

// Helper function to test a specific format
async function testEmailFormat(data) {
  try {
    console.log(`Sending test email with lessonType:`, data.lessonType);
    
    const response = await fetch(`${BASE_URL}/api/test/admin-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Test successful:', result);
      return true;
    } else {
      console.error('❌ Test failed:', result);
      return false;
    }
  } catch (error) {
    console.error('❌ Error during test:', error);
    return false;
  }
}

// Execute the test
testAdminEmailWithDifferentLessonTypes().catch(err => {
  console.error('❌ Unhandled error during test:', err);
  process.exit(1);
});
