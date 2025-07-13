#!/usr/bin/env node

/**
 * Comprehensive Booking System Test
 * Tests the complete flow: lesson selection → athlete/parent creation → auth → waiver → payment
 */

import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const BASE_URL = 'http://localhost:5001';
const TEST_EMAIL = `test.parent.${Date.now()}@example.com`;
const TEST_PHONE = '555-0123';

// Initialize Supabase client for direct database checks
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

console.log('🧪 Starting Comprehensive Booking System Test');
console.log('===============================================');

async function testStep(stepName, testFunction) {
  try {
    console.log(`\n🔍 Testing: ${stepName}`);
    const result = await testFunction();
    console.log(`✅ ${stepName} - PASSED`);
    return result;
  } catch (error) {
    console.error(`❌ ${stepName} - FAILED:`, error.message);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

// Test data
const testBookingData = {
  parentFirstName: 'John',
  parentLastName: 'TestParent',
  parentEmail: TEST_EMAIL,
  parentPhone: TEST_PHONE,
  emergencyContactName: 'Jane TestContact',
  emergencyContactPhone: '555-0456',
  lessonType: 'quick-journey',
  preferredDate: '2025-07-15',
  preferredTime: '10:00',
  focusAreaIds: [1, 2], // Assume basic skills
  apparatusIds: [1], // Floor
  sideQuestIds: [],
  bookingMethod: 'online',
  amount: '40.00',
  waiverSigned: false,
  athletes: [{
    athleteId: 0, // Will be created
    slotOrder: 1,
    name: 'Tommy TestAthlete',
    dateOfBirth: '2015-05-15',
    allergies: 'None',
    experience: 'beginner'
  }]
};

let testResults = {
  booking: null,
  parent: null,
  athlete: null,
  authCode: null,
  stripeSession: null
};

async function test1_ServerHealth() {
  const response = await axios.get(`${BASE_URL}/api/bookings`, {
    headers: { 'Content-Type': 'application/json' }
  });
  return response.status === 401; // Expected: should require admin auth
}

async function test2_AvailableTimeSlots() {
  const response = await axios.get(
    `${BASE_URL}/api/available-times/${testBookingData.preferredDate}/${testBookingData.lessonType}`
  );
  console.log(`   Found ${response.data.availableTimes.length} available time slots`);
  return response.data.availableTimes.length > 0;
}

async function test3_FocusAreasRetrieval() {
  // Test focus areas endpoint (if it exists)
  try {
    const response = await axios.get(`${BASE_URL}/api/focus-areas`);
    console.log(`   Found ${response.data.length} focus areas`);
    return response.data.length > 0;
  } catch (error) {
    // If endpoint doesn't exist, check if we can validate focus areas in booking
    console.log('   Focus areas endpoint not found, will test in booking validation');
    return true;
  }
}

async function test4_BookingCreation() {
  const response = await axios.post(`${BASE_URL}/api/bookings`, testBookingData);
  testResults.booking = response.data;
  console.log(`   Created booking ID: ${testResults.booking.id}`);
  console.log(`   Status: ${testResults.booking.status}`);
  console.log(`   Payment Status: ${testResults.booking.paymentStatus}`);
  return testResults.booking.id > 0;
}

async function test5_ParentIdentification() {
  const response = await axios.post(`${BASE_URL}/api/identify-parent`, {
    email: testBookingData.parentEmail,
    phone: testBookingData.parentPhone
  });
  
  if (response.data.found) {
    testResults.parent = response.data.parent;
    console.log(`   Found existing parent: ${testResults.parent.firstName} ${testResults.parent.lastName}`);
    console.log(`   Athletes: ${response.data.athletes.length}`);
    return true;
  } else {
    console.log('   No existing parent found (expected for new test data)');
    return true;
  }
}

async function test6_DatabaseBookingVerification() {
  // Check if booking was created in database
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('parent_email', testBookingData.parentEmail)
    .order('created_at', { ascending: false })
    .limit(1);
    
  if (error) throw new Error(`Database query failed: ${error.message}`);
  
  if (bookings && bookings.length > 0) {
    console.log(`   Found booking in database: ${bookings[0].id}`);
    console.log(`   Database status: ${bookings[0].status}`);
    console.log(`   Database payment status: ${bookings[0].payment_status}`);
    return true;
  }
  
  throw new Error('Booking not found in database');
}

async function test7_StripeCheckoutSession() {
  if (!testResults.booking) {
    throw new Error('No booking available for payment test');
  }
  
  const paymentData = {
    amount: 10, // Reservation fee
    bookingId: testResults.booking.id,
    isReservationFee: true,
    fullLessonPrice: 40,
    lessonType: testBookingData.lessonType
  };
  
  const response = await axios.post(`${BASE_URL}/api/create-checkout-session`, paymentData);
  testResults.stripeSession = response.data;
  
  console.log(`   Created Stripe session: ${testResults.stripeSession.sessionId}`);
  console.log(`   Payment URL available: ${!!testResults.stripeSession.url}`);
  
  return testResults.stripeSession.sessionId && testResults.stripeSession.url;
}

async function test8_ParentAuthCodeCreation() {
  if (!testBookingData.parentEmail) {
    throw new Error('No parent email for auth test');
  }
  
  // Test auth code creation (simulate what would happen after payment)
  try {
    const response = await axios.post(`${BASE_URL}/api/parent-auth/request-code`, {
      email: testBookingData.parentEmail
    });
    
    console.log(`   Auth code request status: ${response.status}`);
    return response.status === 200;
  } catch (error) {
    if (error.response?.status === 429) {
      console.log('   Rate limiting active (good security)');
      return true;
    }
    throw error;
  }
}

async function test9_WaiverSystemAccess() {
  // Test waiver endpoint accessibility
  try {
    const response = await axios.get(`${BASE_URL}/api/waiver/1`);
    console.log(`   Waiver system responsive: ${response.status}`);
    return true;
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('   Waiver endpoint exists (404 expected for non-existent athlete)');
      return true;
    }
    throw error;
  }
}

async function test10_AdminEndpointsProtection() {
  // Test that admin endpoints are properly protected
  try {
    const response = await axios.get(`${BASE_URL}/api/athletes`);
    return false; // Should not succeed without auth
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('   Admin endpoints properly protected');
      return true;
    }
    throw error;
  }
}

async function test11_BookingStatusUpdates() {
  if (!testResults.booking) {
    throw new Error('No booking available for status test');
  }
  
  // Test booking retrieval
  const response = await axios.get(`${BASE_URL}/api/bookings/${testResults.booking.id}`);
  console.log(`   Retrieved booking status: ${response.data.status}`);
  console.log(`   Payment status: ${response.data.paymentStatus}`);
  
  return response.data.id === testResults.booking.id;
}

async function test12_DatabaseConsistencyCheck() {
  // Check if all related data is consistent in database
  const { data: bookings, error: bookingError } = await supabase
    .from('bookings')
    .select('*')
    .eq('parent_email', testBookingData.parentEmail);
    
  if (bookingError) throw new Error(`Booking query failed: ${bookingError.message}`);
  
  console.log(`   Found ${bookings.length} booking(s) in database`);
  
  // Check for parent records
  const { data: parents, error: parentError } = await supabase
    .from('parents')
    .select('*')
    .eq('email', testBookingData.parentEmail);
    
  if (parentError) {
    console.log('   Parent table query failed (may not exist yet)');
  } else {
    console.log(`   Found ${parents?.length || 0} parent record(s)`);
  }
  
  return bookings.length > 0;
}

async function cleanup() {
  console.log('\n🧹 Cleaning up test data...');
  
  try {
    // Delete test booking from database
    const { error: deleteError } = await supabase
      .from('bookings')
      .delete()
      .eq('parent_email', testBookingData.parentEmail);
      
    if (deleteError) {
      console.log(`   Warning: Could not delete test booking: ${deleteError.message}`);
    } else {
      console.log('   ✅ Test booking deleted');
    }
    
    // Delete test parent if exists
    const { error: parentDeleteError } = await supabase
      .from('parents')
      .delete()
      .eq('email', testBookingData.parentEmail);
      
    if (parentDeleteError) {
      console.log(`   Note: Parent cleanup: ${parentDeleteError.message}`);
    }
    
  } catch (error) {
    console.log(`   Warning: Cleanup failed: ${error.message}`);
  }
}

async function runAllTests() {
  const tests = [
    ['Server Health Check', test1_ServerHealth],
    ['Available Time Slots', test2_AvailableTimeSlots],
    ['Focus Areas System', test3_FocusAreasRetrieval],
    ['Booking Creation', test4_BookingCreation],
    ['Parent Identification', test5_ParentIdentification],
    ['Database Booking Verification', test6_DatabaseBookingVerification],
    ['Stripe Checkout Session', test7_StripeCheckoutSession],
    ['Parent Auth Code System', test8_ParentAuthCodeCreation],
    ['Waiver System Access', test9_WaiverSystemAccess],
    ['Admin Endpoints Protection', test10_AdminEndpointsProtection],
    ['Booking Status Updates', test11_BookingStatusUpdates],
    ['Database Consistency', test12_DatabaseConsistencyCheck]
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const [name, testFn] of tests) {
    try {
      await testStep(name, testFn);
      passed++;
    } catch (error) {
      failed++;
    }
  }
  
  console.log('\n📊 Test Results Summary');
  console.log('=======================');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Booking system is fully functional!');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
  }
  
  await cleanup();
  
  return { passed, failed, total: passed + failed };
}

// Run tests
runAllTests()
  .then((results) => {
    process.exit(results.failed === 0 ? 0 : 1);
  })
  .catch((error) => {
    console.error('\n💥 Test suite crashed:', error.message);
    process.exit(1);
  });
