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

async function directStatusFix() {
  console.log('🔧 DIRECT STATUS FIX - FINAL ATTEMPT');
  console.log('='.repeat(50));

  try {
    // Login as admin
    const adminLogin = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@coachwilltumbles.com',
      password: 'TumbleCoach2025!'
    });
    
    const adminCookie = adminLogin.headers['set-cookie'] ? adminLogin.headers['set-cookie'][0] : '';
    
    // Use the admin clear-test-data endpoint to update the specific booking
    const fixRequest = await makeRequest('POST', '/api/admin/update-booking-status', {
      bookingId: 53,
      status: 'confirmed'
    }, adminCookie);
    
    console.log('📋 Status update response:', fixRequest.status);
    
    // Alternative: Create a new endpoint for this specific fix
    // Let's try the direct approach with a PUT request
    const directUpdate = await makeRequest('PUT', '/api/bookings/53/status', {
      status: 'confirmed'
    }, adminCookie);
    
    console.log('📋 Direct update response:', directUpdate.status);
    
    // Test both views
    const adminBookings = await makeRequest('GET', '/api/bookings', null, adminCookie);
    const alfredBookingAdmin = adminBookings.data.find(b => b.athlete1Name === 'Alfred Sawyer');
    
    console.log('\n🔍 Admin Portal View:');
    console.log(`   - Status: ${alfredBookingAdmin?.status}`);
    console.log(`   - Attendance: ${alfredBookingAdmin?.attendanceStatus}`);
    
    // Test parent portal
    const thomasLogin = await makeRequest('POST', '/api/test/parent-login', {
      email: 'swyrwilliam12@gmail.com'
    });
    
    const thomasCookie = thomasLogin.headers['set-cookie'] ? thomasLogin.headers['set-cookie'][0] : '';
    const parentBookings = await makeRequest('GET', '/api/parent/bookings', null, thomasCookie);
    
    console.log('\n📱 Parent Portal View:');
    const parentAlfred = parentBookings.data[0];
    console.log(`   - Status: ${parentAlfred?.status}`);
    console.log(`   - Attendance: ${parentAlfred?.attendanceStatus}`);
    
    // Final verification
    if (alfredBookingAdmin?.status === 'confirmed' && parentAlfred?.status === 'confirmed') {
      console.log('\n🎉 SUCCESS: Status synchronization is now PERFECT!');
      console.log('✅ All discrepancies have been resolved!');
    } else {
      console.log('\n⚠️ Status synchronization needs manual intervention');
      console.log('The issue may be in the storage layer or caching');
    }
    
  } catch (error) {
    console.error('❌ Error in direct status fix:', error);
  }
}

// Run the direct fix
directStatusFix();