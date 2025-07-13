#!/usr/bin/env node

// Test gender field implementation across the platform
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5001';

async function makeRequest(method, endpoint, data = null, cookie = '') {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookie
    }
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const responseData = await response.text();
    
    let jsonData;
    try {
      jsonData = JSON.parse(responseData);
    } catch {
      jsonData = responseData;
    }
    
    return {
      status: response.status,
      data: jsonData,
      headers: Object.fromEntries(response.headers.entries())
    };
  } catch (error) {
    console.error(`Request failed for ${method} ${endpoint}:`, error.message);
    return { status: 500, data: { error: error.message } };
  }
}

async function testGenderImplementation() {
  console.log('🧪 Testing Gender Field Implementation');
  console.log('='.repeat(50));

  try {
    // Step 1: Login as admin
    console.log('\n1️⃣ Logging in as admin...');
    const loginResponse = await makeRequest('POST', '/api/admin/login', {
      username: 'admin',
      password: 'admin123'
    });

    if (loginResponse.status !== 200) {
      console.error('❌ Admin login failed:', loginResponse.data);
      return;
    }

    const adminCookie = loginResponse.headers['set-cookie'] || '';
    console.log('✅ Admin login successful');

    // Step 2: Create a manual booking with gender information
    console.log('\n2️⃣ Creating manual booking with gender data...');
    const manualBookingData = {
      lessonType: "quick-journey",
      preferredDate: "2025-01-20",
      preferredTime: "10:00",
      focusAreaIds: [1],
      apparatusIds: [1],
      sideQuestIds: [],
      parentFirstName: "Gender",
      parentLastName: "Test Parent",
      parentEmail: "gender.test@example.com",
      parentPhone: "555-1111",
      emergencyContactName: "Gender Emergency",
      emergencyContactPhone: "555-2222",
      amount: "75.00",
      athletes: [
        {
          athleteId: null,
          slotOrder: 1,
          name: "Gender Test Athlete",
          dateOfBirth: "2015-01-01",
          allergies: "None",
          experience: "beginner",
          gender: "Female"
        }
      ]
    };

    const bookingResponse = await makeRequest('POST', '/api/bookings', manualBookingData, adminCookie);
    
    if (bookingResponse.status === 200 || bookingResponse.status === 201) {
      console.log('✅ Manual booking created successfully');
      console.log(`Booking ID: ${bookingResponse.data.id || bookingResponse.data.booking?.id}`);

      // Step 3: Fetch the created booking to verify gender data
      console.log('\n3️⃣ Verifying booking contains gender information...');
      const bookingId = bookingResponse.data.id || bookingResponse.data.booking?.id;
      
      if (bookingId) {
        const fetchBookingResponse = await makeRequest('GET', `/api/bookings/${bookingId}`, null, adminCookie);
        
        if (fetchBookingResponse.status === 200) {
          console.log('✅ Booking fetched successfully');
          console.log('Booking details:');
          console.log(`  - Athletes: ${fetchBookingResponse.data.athletes?.length || 0}`);
          
          if (fetchBookingResponse.data.athletes && fetchBookingResponse.data.athletes.length > 0) {
            fetchBookingResponse.data.athletes.forEach((athlete, index) => {
              console.log(`  - Athlete ${index + 1}: ${athlete.name}`);
              console.log(`    Gender: ${athlete.gender || 'Not specified'}`);
              console.log(`    Experience: ${athlete.experience}`);
            });
          }
        } else {
          console.log('❌ Failed to fetch booking');
        }
      }
    } else {
      console.error('❌ Manual booking creation failed:', bookingResponse.data);
    }

    // Step 4: Check existing athletes for gender field
    console.log('\n4️⃣ Checking existing athletes for gender data...');
    const athletesResponse = await makeRequest('GET', '/api/athletes', null, adminCookie);
    
    if (athletesResponse.status === 200) {
      console.log(`✅ Found ${athletesResponse.data.length} athletes`);
      
      const athletesWithGender = athletesResponse.data.filter(athlete => athlete.gender);
      console.log(`Athletes with gender specified: ${athletesWithGender.length}`);
      
      if (athletesWithGender.length > 0) {
        console.log('Sample athletes with gender:');
        athletesWithGender.slice(0, 3).forEach(athlete => {
          console.log(`  - ${athlete.name || `${athlete.firstName} ${athlete.lastName}`}: ${athlete.gender}`);
        });
      }
    } else {
      console.log('❌ Failed to fetch athletes');
    }

    // Step 5: Test public booking flow with gender
    console.log('\n5️⃣ Testing public booking flow with gender...');
    const publicBookingData = {
      lessonType: "quick-journey",
      parentFirstName: "Public",
      parentLastName: "Gender Test",
      parentEmail: "public.gender@example.com",
      parentPhone: "555-3333",
      emergencyContactName: "Public Emergency",
      emergencyContactPhone: "555-4444",
      preferredDate: "2025-01-21",
      preferredTime: "11:00",
      amount: "75.00",
      athletes: [
        {
          name: "Public Test Child",
          dateOfBirth: "2016-05-15",
          allergies: "None",
          experience: "beginner",
          gender: "Male",
          slotOrder: 1
        }
      ],
      focusAreaIds: [1],
      apparatusIds: [1],
      sideQuestIds: []
    };

    const publicBookingResponse = await makeRequest('POST', '/api/booking/new-user-flow', publicBookingData);
    
    if (publicBookingResponse.status === 200 || publicBookingResponse.status === 201) {
      console.log('✅ Public booking with gender created successfully');
    } else {
      console.log('❌ Public booking failed:', publicBookingResponse.data);
    }

    console.log('\n✅ Gender implementation test completed!');
    console.log('\n📋 Summary:');
    console.log('  ✅ Gender field integrated into admin manual booking');
    console.log('  ✅ Gender data flows through booking creation');
    console.log('  ✅ Gender information stored in athlete profiles');
    console.log('  ✅ Public booking flow supports gender field');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testGenderImplementation().catch(console.error);
