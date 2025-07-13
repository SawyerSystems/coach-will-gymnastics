import http from 'http';

async function makeRequest(method, path, body = null, cookie = '') {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: path,
    method: method,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  if (cookie) {
    options.headers['Cookie'] = cookie;
  }

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: parsedData,
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

async function testBookingPaymentFlow() {
  console.log('🧪 Testing Booking Creation and Payment Flow\n');

  try {
    // 1. Check Alfred's booking for July 7th
    console.log('1️⃣ Checking Alfred\'s booking details...');
    
    // Login as admin to check bookings
    const adminLogin = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@coachwilltumbles.com',
      password: 'TumbleCoach2025!'
    });
    
    const adminCookie = adminLogin.headers['set-cookie'] ? adminLogin.headers['set-cookie'][0] : '';
    
    // Get all bookings
    const bookings = await makeRequest('GET', '/api/bookings', null, adminCookie);
    console.log('Total bookings:', bookings.data.length);
    
    if (bookings.data.length > 0) {
      const alfredBooking = bookings.data.find(b => 
        b.athlete1Name === 'Alfred Sawyer' && 
        b.preferredDate === '2025-07-07'
      );
      
      if (alfredBooking) {
        console.log('\n📅 Alfred\'s Booking Details:');
        console.log('- ID:', alfredBooking.id);
        console.log('- Date:', alfredBooking.preferredDate);
        console.log('- Time:', alfredBooking.preferredTime);
        console.log('- Status:', alfredBooking.status);
        console.log('- Payment Status:', alfredBooking.paymentStatus);
        console.log('- Stripe Session ID:', alfredBooking.stripeSessionId || 'None');
        console.log('- Amount:', alfredBooking.amount);
        
        // Check if this booking appears in upcoming tab
        const today = new Date();
        const bookingDate = new Date(alfredBooking.preferredDate);
        const daysDiff = Math.ceil((bookingDate - today) / (1000 * 60 * 60 * 24));
        console.log('- Days until lesson:', daysDiff);
        console.log('- Should appear in upcoming:', daysDiff >= 0 && daysDiff <= 7 ? 'Yes' : 'No');
      } else {
        console.log('❌ Alfred\'s booking for July 7th not found!');
      }
    }
    
    // 2. Test booking success page with a session ID
    console.log('\n2️⃣ Testing booking success page...');
    if (bookings.data.length > 0 && bookings.data[0].stripeSessionId) {
      const sessionId = bookings.data[0].stripeSessionId;
      console.log('Testing with session ID:', sessionId);
      
      const bookingBySession = await makeRequest('GET', `/api/booking-by-session/${sessionId}`);
      console.log('Booking by session response:', bookingBySession.status);
      if (bookingBySession.status === 200) {
        console.log('✅ Booking success page API working');
      } else {
        console.log('❌ Booking success page API issue:', bookingBySession.data);
      }
    } else {
      console.log('⚠️  No bookings have Stripe session IDs for testing');
    }
    
    // 3. Test payment status update
    console.log('\n3️⃣ Testing payment status update...');
    if (bookings.data.length > 0) {
      const testBooking = bookings.data[0];
      
      // Update payment status
      const updateResponse = await makeRequest('PATCH', `/api/bookings/${testBooking.id}`, {
        paymentStatus: 'paid',
        stripeSessionId: 'test_session_123'
      }, adminCookie);
      
      if (updateResponse.status === 200) {
        console.log('✅ Payment status updated successfully');
        
        // Verify the update
        const updatedBookings = await makeRequest('GET', '/api/bookings', null, adminCookie);
        const updatedBooking = updatedBookings.data.find(b => b.id === testBooking.id);
        console.log('Updated payment status:', updatedBooking.paymentStatus);
        console.log('Updated session ID:', updatedBooking.stripeSessionId);
      } else {
        console.log('❌ Failed to update payment status:', updateResponse.data);
      }
    }
    
    // 4. Test new booking creation flow
    console.log('\n4️⃣ Testing new booking creation...');
    
    // Create a new test booking
    const newBooking = {
      lessonType: 'quick-journey',
      athlete1Name: 'Test Athlete',
      athlete1DateOfBirth: '2015-01-01',
      athlete1Experience: 'beginner',
      athlete1Allergies: 'None',
      preferredDate: '2025-07-10',
      preferredTime: '10:00',
      focusAreas: ['Tumbling: Cartwheel'],
      parentFirstName: 'Test',
      parentLastName: 'Parent',
      parentEmail: 'test@example.com',
      parentPhone: '1234567890',
      emergencyContactName: 'Emergency Contact',
      emergencyContactPhone: '0987654321',
      dropoffPersonName: 'Test Parent',
      dropoffPersonPhone: '1234567890',
      dropoffPersonRelationship: 'parent',
      pickupPersonName: 'Test Parent',
      pickupPersonPhone: '1234567890',
      pickupPersonRelationship: 'parent',
      amount: 10,
      waiverSigned: true,
      waiverSignedAt: new Date().toISOString(),
      waiverSignatureName: 'Test Parent'
    };
    
    const createResponse = await makeRequest('POST', '/api/bookings', newBooking);
    
    if (createResponse.status === 200) {
      console.log('✅ New booking created successfully');
      console.log('Booking ID:', createResponse.data.id);
      
      // Check if athlete was created
      const allAthletes = await makeRequest('GET', '/api/athletes', null, adminCookie);
      const newAthlete = allAthletes.data.find(a => a.name === 'Test Athlete');
      if (newAthlete) {
        console.log('✅ Athlete was automatically created');
      } else {
        console.log('⚠️  Athlete was not created automatically');
      }
      
      // Clean up test booking
      await makeRequest('DELETE', `/api/bookings/${createResponse.data.id}`, null, adminCookie);
      console.log('🧹 Test booking cleaned up');
    } else {
      console.log('❌ Failed to create booking:', createResponse.data);
    }
    
    console.log('\n✅ Test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testBookingPaymentFlow();