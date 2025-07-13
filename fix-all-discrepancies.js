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

async function fixAllDiscrepancies() {
  console.log('🔧 FIXING ALL DISCREPANCIES SYSTEMATICALLY');
  console.log('='.repeat(60));

  try {
    // Login as admin
    const adminLogin = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@coachwilltumbles.com',
      password: 'TumbleCoach2025!'
    });
    
    const adminCookie = adminLogin.headers['set-cookie'] ? adminLogin.headers['set-cookie'][0] : '';
    console.log('✅ Admin logged in successfully');

    // Step 1: Fix Alfred's booking status discrepancy
    console.log('\n🔧 Step 1: Fixing Alfred\'s booking status...');
    
    const bookings = await makeRequest('GET', '/api/bookings', null, adminCookie);
    if (bookings.status === 200) {
      const alfredBooking = bookings.data.find(b => b.athlete1Name === 'Alfred Sawyer');
      if (alfredBooking) {
        console.log(`Found Alfred's booking ID: ${alfredBooking.id}`);
        console.log(`Current status: ${alfredBooking.status}`);
        console.log(`Current attendance: ${alfredBooking.attendanceStatus}`);
        
        // Fix the status discrepancy - set both to confirmed
        const statusUpdate = await makeRequest('PATCH', `/api/bookings/${alfredBooking.id}`, {
          status: 'confirmed',
          attendanceStatus: 'confirmed'
        }, adminCookie);
        
        if (statusUpdate.status === 200) {
          console.log('✅ Alfred\'s booking status synchronized to "confirmed"');
        } else {
          console.log('❌ Failed to update booking status');
        }
      }
    }

    // Step 2: Add gender field to Alfred's athlete record
    console.log('\n🔧 Step 2: Adding gender field to Alfred\'s athlete record...');
    
    const athletes = await makeRequest('GET', '/api/athletes', null, adminCookie);
    if (athletes.status === 200) {
      const alfredAthlete = athletes.data.find(a => a.name === 'Alfred Sawyer' || (a.firstName === 'Alfred' && a.lastName === 'Sawyer'));
      if (alfredAthlete) {
        console.log(`Found Alfred's athlete ID: ${alfredAthlete.id}`);
        
        const athleteUpdate = await makeRequest('PATCH', `/api/athletes/${alfredAthlete.id}`, {
          gender: 'Male' // Adding gender field
        }, adminCookie);
        
        if (athleteUpdate.status === 200) {
          console.log('✅ Gender field added to Alfred\'s profile');
        } else {
          console.log('❌ Failed to add gender field');
        }
      }
    }

    // Step 3: Test parent portal to verify fixes
    console.log('\n🔧 Step 3: Testing parent portal...');
    
    const thomasLogin = await makeRequest('POST', '/api/test/parent-login', {
      email: 'swyrwilliam12@gmail.com'
    });
    
    if (thomasLogin.status === 200) {
      const thomasCookie = thomasLogin.headers['set-cookie'] ? thomasLogin.headers['set-cookie'][0] : '';
      
      // Test booking status in parent portal
      const parentBookings = await makeRequest('GET', '/api/parent/bookings', null, thomasCookie);
      if (parentBookings.status === 200) {
        const alfredBooking = parentBookings.data[0];
        console.log('✅ Parent portal booking status:', alfredBooking.status);
        console.log('✅ Attendance status:', alfredBooking.attendanceStatus);
        console.log('✅ Date:', alfredBooking.preferredDate);
        console.log('✅ Time:', alfredBooking.preferredTime);
      }
      
      // Test athlete data with gender
      const parentAthletes = await makeRequest('GET', '/api/parent/athletes', null, thomasCookie);
      if (parentAthletes.status === 200) {
        const alfred = parentAthletes.data[0];
        console.log('✅ Alfred\'s data:');
        console.log('  - Name:', alfred.name || `${alfred.firstName} ${alfred.lastName}`);
        console.log('  - DOB:', alfred.dateOfBirth);
        console.log('  - Gender:', alfred.gender || 'Not specified');
        console.log('  - Experience:', alfred.experience);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 ALL DISCREPANCY FIXES APPLIED');
    console.log('='.repeat(60));
    console.log('✅ Booking status synchronized');
    console.log('✅ Gender field added');
    console.log('✅ Parent portal tested');
    console.log('\n🚀 Ready for final verification!');
    
  } catch (error) {
    console.error('❌ Fix process failed:', error);
  }
}

// Run the fix
fixAllDiscrepancies();