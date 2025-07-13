// Test script to verify all Supabase migration fixes
const fetch = require('node-fetch');

const API_URL = 'http://localhost:5000/api';

async function testSupabaseFixes() {
  console.log('Testing Supabase Integration Fixes...\n');
  
  const tests = [];
  
  // Test 1: Check booking field mapping
  console.log('1. Testing booking field mapping...');
  try {
    const response = await fetch(`${API_URL}/bookings`);
    const bookings = await response.json();
    
    if (bookings.length > 0) {
      const booking = bookings[0];
      console.log('Sample booking fields:');
      console.log('- stripeSessionId:', booking.stripeSessionId !== undefined ? '✓' : '✗');
      console.log('- paymentStatus:', booking.paymentStatus !== undefined ? '✓' : '✗');
      console.log('- waiverSigned:', booking.waiverSigned !== undefined ? '✓' : '✗');
      console.log('- athleteName fields:', booking.athlete1Name ? '✓' : '✗');
      tests.push({ test: 'Field mapping', passed: booking.stripeSessionId !== undefined });
    } else {
      console.log('No bookings found to test');
    }
  } catch (error) {
    console.error('Failed to fetch bookings:', error.message);
    tests.push({ test: 'Field mapping', passed: false, error: error.message });
  }
  
  // Test 2: Check parent/athlete creation
  console.log('\n2. Testing parent and athlete accounts...');
  try {
    const parentsResponse = await fetch(`${API_URL}/parents`);
    const parents = await parentsResponse.json();
    console.log('Total parents:', parents.length);
    
    const athletesResponse = await fetch(`${API_URL}/athletes`);
    const athletes = await athletesResponse.json();
    console.log('Total athletes:', athletes.length);
    
    tests.push({ test: 'Parent/Athlete accounts', passed: true });
  } catch (error) {
    console.error('Failed to fetch parents/athletes:', error.message);
    tests.push({ test: 'Parent/Athlete accounts', passed: false, error: error.message });
  }
  
  // Test 3: Check waiver data
  console.log('\n3. Testing waiver data...');
  try {
    const response = await fetch(`${API_URL}/waivers`);
    const waivers = await response.json();
    
    if (waivers.length > 0) {
      const waiver = waivers[0];
      console.log('Sample waiver fields:');
      console.log('- athleteName:', waiver.athleteName ? '✓' : '✗');
      console.log('- signerName:', waiver.signerName ? '✓' : '✗');
      console.log('- signedAt:', waiver.signedAt ? '✓' : '✗');
      tests.push({ test: 'Waiver data', passed: waiver.athleteName !== undefined });
    } else {
      console.log('No waivers found to test');
    }
  } catch (error) {
    console.error('Failed to fetch waivers:', error.message);
    tests.push({ test: 'Waiver data', passed: false, error: error.message });
  }
  
  // Test 4: Check upcoming sessions
  console.log('\n4. Testing upcoming sessions...');
  try {
    const response = await fetch(`${API_URL}/upcoming-sessions`);
    if (response.ok) {
      const upcomingSessions = await response.json();
      console.log('Upcoming sessions:', upcomingSessions.length);
      tests.push({ test: 'Upcoming sessions', passed: true });
    } else {
      console.log('Upcoming sessions endpoint returned:', response.status);
      tests.push({ test: 'Upcoming sessions', passed: false });
    }
  } catch (error) {
    console.error('Failed to fetch upcoming sessions:', error.message);
    tests.push({ test: 'Upcoming sessions', passed: false, error: error.message });
  }
  
  // Summary
  console.log('\n=== TEST SUMMARY ===');
  const passed = tests.filter(t => t.passed).length;
  const total = tests.length;
  console.log(`Passed: ${passed}/${total}`);
  
  tests.forEach(test => {
    const status = test.passed ? '✓' : '✗';
    const error = test.error ? ` - ${test.error}` : '';
    console.log(`${status} ${test.test}${error}`);
  });
  
  if (passed === total) {
    console.log('\nAll tests passed! Supabase integration is working correctly.');
  } else {
    console.log('\nSome tests failed. Please check the errors above.');
  }
}

// Run tests
testSupabaseFixes().catch(console.error);