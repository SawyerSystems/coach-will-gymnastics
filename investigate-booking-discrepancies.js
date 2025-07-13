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

async function investigateBookingDiscrepancies() {
  console.log('🔍 INVESTIGATING BOOKING DISCREPANCIES');
  console.log('='.repeat(60));

  try {
    // Login as Thomas (Alfred's parent)
    const thomasLogin = await makeRequest('POST', '/api/test/parent-login', {
      email: 'swyrwilliam12@gmail.com'
    });
    
    if (thomasLogin.status !== 200) {
      console.log('❌ Failed to login as Thomas');
      return;
    }
    
    const thomasCookie = thomasLogin.headers['set-cookie'] ? thomasLogin.headers['set-cookie'][0] : '';
    console.log('✅ Thomas logged in successfully');
    
    // Get parent bookings
    const parentBookings = await makeRequest('GET', '/api/parent/bookings', null, thomasCookie);
    console.log('\n📋 PARENT PORTAL BOOKINGS:');
    console.log('Status:', parentBookings.status);
    
    if (parentBookings.status === 200) {
      parentBookings.data.forEach(booking => {
        console.log(`\n📅 Booking ID: ${booking.id}`);
        console.log(`📝 Lesson Type: ${booking.lessonType}`);
        console.log(`📅 Preferred Date: ${booking.preferredDate}`);
        console.log(`⏰ Preferred Time: ${booking.preferredTime}`);
        console.log(`👤 Athlete: ${booking.athlete1Name}`);
        console.log(`📊 Status: ${booking.status}`);
        console.log(`💰 Payment Status: ${booking.paymentStatus}`);
        console.log(`📋 Attendance Status: ${booking.attendanceStatus}`);
        console.log(`📝 Waiver Signed: ${booking.waiverSigned}`);
        console.log(`📝 Waiver At: ${booking.waiverSignedAt}`);
      });
    }

    // Login as admin to compare
    const adminLogin = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@coachwilltumbles.com',
      password: 'TumbleCoach2025!'
    });
    
    const adminCookie = adminLogin.headers['set-cookie'] ? adminLogin.headers['set-cookie'][0] : '';
    console.log('\n✅ Admin logged in successfully');
    
    // Get admin bookings
    const adminBookings = await makeRequest('GET', '/api/bookings', null, adminCookie);
    console.log('\n📋 ADMIN DASHBOARD BOOKINGS:');
    console.log('Status:', adminBookings.status);
    
    if (adminBookings.status === 200) {
      // Find Alfred's booking
      const alfredBooking = adminBookings.data.find(b => b.athlete1Name === 'Alfred Sawyer');
      if (alfredBooking) {
        console.log(`\n📅 Alfred's Booking - Admin View:`);
        console.log(`📝 ID: ${alfredBooking.id}`);
        console.log(`📅 Preferred Date: ${alfredBooking.preferredDate}`);
        console.log(`⏰ Preferred Time: ${alfredBooking.preferredTime}`);
        console.log(`📊 Status: ${alfredBooking.status}`);
        console.log(`💰 Payment Status: ${alfredBooking.paymentStatus}`);
        console.log(`📋 Attendance Status: ${alfredBooking.attendanceStatus}`);
        console.log(`📝 Waiver Signed: ${alfredBooking.waiverSigned}`);
        console.log(`📝 Waiver At: ${alfredBooking.waiverSignedAt}`);
      }
    }

    // Get athlete data
    const athleteData = await makeRequest('GET', '/api/parent/athletes', null, thomasCookie);
    console.log('\n👤 ATHLETE DATA:');
    if (athleteData.status === 200) {
      athleteData.data.forEach(athlete => {
        console.log(`\n👤 Athlete: ${athlete.name || `${athlete.firstName} ${athlete.lastName}`}`);
        console.log(`📅 DOB: ${athlete.dateOfBirth}`);
        console.log(`🎂 Age: ${athlete.age || 'Not calculated'}`);
        console.log(`📊 Experience: ${athlete.experience}`);
        console.log(`🏥 Allergies: ${athlete.allergies}`);
        console.log(`👥 Gender: ${athlete.gender || 'Not specified'}`);
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎯 DISCREPANCY ANALYSIS COMPLETE');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Investigation failed:', error);
  }
}

// Run the investigation
investigateBookingDiscrepancies();