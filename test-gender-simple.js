#!/usr/bin/env node

// Simplified test for gender field implementation
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

async function testGenderFieldSimple() {
  console.log('🧪 Simple Gender Field Test');
  console.log('='.repeat(40));

  try {
    // Test public booking flow with gender - this worked in the previous test
    console.log('\n1️⃣ Testing public booking flow with gender...');
    const publicBookingData = {
      lessonType: "quick-journey",
      parentFirstName: "Gender",
      parentLastName: "Test Parent",
      parentEmail: "simple.gender@example.com",
      parentPhone: "555-5555",
      emergencyContactName: "Emergency Contact",
      emergencyContactPhone: "555-6666",
      preferredDate: "2025-01-15",
      preferredTime: "10:00",
      amount: "75.00",
      athletes: [
        {
          name: "Simple Gender Test",
          dateOfBirth: "2016-03-20",
          allergies: "None",
          experience: "beginner",
          gender: "Other",
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
      console.log(`Booking created: ${JSON.stringify(publicBookingResponse.data, null, 2)}`);
    } else {
      console.log('❌ Public booking failed:', publicBookingResponse.data);
    }

    // Test 2: Login as admin and check athletes
    console.log('\n2️⃣ Checking athletes as admin...');
    const loginResponse = await makeRequest('POST', '/api/admin/login', {
      username: 'admin',
      password: 'admin123'
    });

    if (loginResponse.status === 200) {
      const adminCookie = loginResponse.headers['set-cookie'] || '';
      console.log('✅ Admin login successful');

      // Fetch athletes to see if gender field exists
      const athletesResponse = await makeRequest('GET', '/api/athletes', null, adminCookie);
      
      if (athletesResponse.status === 200) {
        console.log(`✅ Found ${athletesResponse.data.length} athletes`);
        
        const athletesWithGender = athletesResponse.data.filter(athlete => athlete.gender);
        console.log(`Athletes with gender specified: ${athletesWithGender.length}`);
        
        if (athletesWithGender.length > 0) {
          console.log('Athletes with gender:');
          athletesWithGender.forEach(athlete => {
            console.log(`  - ${athlete.name || `${athlete.firstName} ${athlete.lastName}`}: ${athlete.gender}`);
          });
        }

        // Check the most recent athlete for our test
        const recentAthlete = athletesResponse.data[athletesResponse.data.length - 1];
        if (recentAthlete) {
          console.log('\nMost recent athlete:');
          console.log(`  - Name: ${recentAthlete.name || `${recentAthlete.firstName} ${recentAthlete.lastName}`}`);
          console.log(`  - Gender: ${recentAthlete.gender || 'Not specified'}`);
          console.log(`  - Experience: ${recentAthlete.experience}`);
          console.log(`  - Date of Birth: ${recentAthlete.dateOfBirth}`);
        }
      } else {
        console.log('❌ Failed to fetch athletes:', athletesResponse.data);
      }
    } else {
      console.log('❌ Admin login failed');
    }

    console.log('\n✅ Simple gender field test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testGenderFieldSimple().catch(console.error);
