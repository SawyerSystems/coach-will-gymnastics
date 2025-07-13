#!/usr/bin/env node

// Test gender field implementation with proper time slots
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

async function testGenderWithValidSlot() {
  console.log('🧪 Testing Gender Field with Valid Time Slot');
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

    // Step 2: Get available time slots
    console.log('\n2️⃣ Getting available time slots...');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    
    const availableTimesResponse = await makeRequest('GET', `/api/available-times?date=${dateStr}&lessonType=quick-journey`);
    
    if (availableTimesResponse.status === 200 && availableTimesResponse.data.length > 0) {
      const availableSlot = availableTimesResponse.data[0];
      console.log(`✅ Found available slot: ${availableSlot.date} at ${availableSlot.time}`);

      // Step 3: Create manual booking with gender using available slot
      console.log('\n3️⃣ Creating manual booking with gender data...');
      const manualBookingData = {
        lessonType: "quick-journey",
        preferredDate: availableSlot.date,
        preferredTime: availableSlot.time,
        focusAreaIds: [1],
        apparatusIds: [1], 
        sideQuestIds: [],
        parentFirstName: "Gender",
        parentLastName: "Test Parent",
        parentEmail: "gender.test2@example.com",
        parentPhone: "555-1111",
        emergencyContactName: "Gender Emergency",
        emergencyContactPhone: "555-2222",
        amount: "75.00",
        athletes: [
          {
            athleteId: null,
            slotOrder: 1,
            name: "Gender Test Athlete 2",
            dateOfBirth: "2015-01-01",
            allergies: "None",
            experience: "beginner",
            gender: "Female"
          }
        ]
      };

      const bookingResponse = await makeRequest('POST', '/api/bookings', manualBookingData, adminCookie);
      
      if (bookingResponse.status === 200 || bookingResponse.status === 201) {
        console.log('✅ Manual booking with gender created successfully!');
        console.log(`Booking ID: ${bookingResponse.data.id || bookingResponse.data.booking?.id}`);

        // Step 4: Verify the booking has gender data
        const bookingId = bookingResponse.data.id || bookingResponse.data.booking?.id;
        
        if (bookingId) {
          console.log('\n4️⃣ Verifying gender data in created booking...');
          const fetchBookingResponse = await makeRequest('GET', `/api/bookings/${bookingId}`, null, adminCookie);
          
          if (fetchBookingResponse.status === 200) {
            console.log('✅ Booking fetched successfully');
            
            if (fetchBookingResponse.data.athletes && fetchBookingResponse.data.athletes.length > 0) {
              console.log('Athlete details:');
              fetchBookingResponse.data.athletes.forEach((athlete, index) => {
                console.log(`  - Athlete ${index + 1}: ${athlete.name}`);
                console.log(`    Gender: ${athlete.gender || 'Not specified'}`);
                console.log(`    Experience: ${athlete.experience}`);
                console.log(`    Allergies: ${athlete.allergies || 'None'}`);
              });
            } else {
              console.log('❌ No athletes found in booking response');
            }
          } else {
            console.log('❌ Failed to fetch created booking');
          }
        }

        // Step 5: Check if athlete was created with gender
        console.log('\n5️⃣ Checking if athlete was created with gender...');
        const athletesResponse = await makeRequest('GET', '/api/athletes', null, adminCookie);
        
        if (athletesResponse.status === 200) {
          const genderTestAthlete = athletesResponse.data.find(athlete => 
            athlete.name?.includes('Gender Test Athlete') || 
            (athlete.firstName + ' ' + athlete.lastName).includes('Gender Test Athlete')
          );
          
          if (genderTestAthlete) {
            console.log('✅ Gender test athlete found in database:');
            console.log(`  - Name: ${genderTestAthlete.name || `${genderTestAthlete.firstName} ${genderTestAthlete.lastName}`}`);
            console.log(`  - Gender: ${genderTestAthlete.gender || 'Not specified'}`);
            console.log(`  - Experience: ${genderTestAthlete.experience}`);
          } else {
            console.log('❌ Gender test athlete not found in athletes list');
          }
        } else {
          console.log('❌ Failed to fetch athletes');
        }

      } else {
        console.error('❌ Manual booking creation failed:', bookingResponse.data);
      }

    } else {
      console.log('❌ No available time slots found');
      console.log('Available times response:', availableTimesResponse.data);
    }

    console.log('\n✅ Gender field test with valid slot completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testGenderWithValidSlot().catch(console.error);
