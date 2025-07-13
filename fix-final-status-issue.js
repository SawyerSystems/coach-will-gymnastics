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

async function fixFinalStatusIssue() {
  console.log('🔧 FIXING FINAL STATUS ISSUE');
  console.log('='.repeat(50));

  try {
    // Login as admin
    const adminLogin = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@coachwilltumbles.com',
      password: 'TumbleCoach2025!'
    });
    
    if (adminLogin.status !== 200) {
      console.log('❌ Failed to login as admin');
      return;
    }
    
    const adminCookie = adminLogin.headers['set-cookie'] ? adminLogin.headers['set-cookie'][0] : '';
    
    // Get Alfred's booking
    const bookings = await makeRequest('GET', '/api/bookings', null, adminCookie);
    if (bookings.status !== 200) {
      console.log('❌ Failed to get bookings');
      return;
    }
    
    const alfredBooking = bookings.data.find(b => b.athlete1Name === 'Alfred Sawyer');
    if (!alfredBooking) {
      console.log('❌ Alfred\'s booking not found');
      return;
    }
    
    console.log(`📋 Current Alfred's booking:`)
    console.log(`   - ID: ${alfredBooking.id}`);
    console.log(`   - Status: ${alfredBooking.status}`);
    console.log(`   - Attendance: ${alfredBooking.attendanceStatus}`);
    console.log(`   - Payment: ${alfredBooking.paymentStatus}`);
    
    // Update booking status to "confirmed"
    const updateResult = await makeRequest('PATCH', `/api/bookings/${alfredBooking.id}`, {
      status: 'confirmed'
    }, adminCookie);
    
    if (updateResult.status === 200) {
      console.log('✅ Successfully updated booking status to "confirmed"');
    } else {
      console.log('❌ Failed to update booking status');
    }
    
    // Verify the fix
    const verifyBookings = await makeRequest('GET', '/api/bookings', null, adminCookie);
    const verifyAlfred = verifyBookings.data.find(b => b.athlete1Name === 'Alfred Sawyer');
    
    if (verifyAlfred && verifyAlfred.status === 'confirmed') {
      console.log('✅ VERIFIED: Alfred\'s booking status is now "confirmed"');
    } else {
      console.log('❌ Verification failed');
    }
    
    // Test parent portal view
    const thomasLogin = await makeRequest('POST', '/api/test/parent-login', {
      email: 'swyrwilliam12@gmail.com'
    });
    
    const thomasCookie = thomasLogin.headers['set-cookie'] ? thomasLogin.headers['set-cookie'][0] : '';
    const parentBookings = await makeRequest('GET', '/api/parent/bookings', null, thomasCookie);
    
    if (parentBookings.status === 200 && parentBookings.data.length > 0) {
      const parentAlfred = parentBookings.data[0];
      console.log('\n📱 Parent Portal View:');
      console.log(`   - Status: ${parentAlfred.status}`);
      console.log(`   - Attendance: ${parentAlfred.attendanceStatus}`);
      console.log(`   - Payment: ${parentAlfred.paymentStatus}`);
      
      if (parentAlfred.status === 'confirmed' && parentAlfred.attendanceStatus === 'confirmed') {
        console.log('🎉 SUCCESS: Status synchronization is now PERFECT!');
      } else {
        console.log('❌ Status synchronization still has issues');
      }
    }
    
  } catch (error) {
    console.error('❌ Error fixing final status issue:', error);
  }
}

// Run the fix
fixFinalStatusIssue();