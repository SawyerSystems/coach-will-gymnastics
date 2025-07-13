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

async function testParentDashboard() {
  console.log('🧪 Testing Parent Dashboard - Final Verification\n');

  try {
    // 1. Use test login endpoint
    console.log('1️⃣ Logging in parent using test endpoint...');
    const loginResponse = await makeRequest('POST', '/api/test/parent-login', {
      email: 'swyrwilliam12@gmail.com'
    });
    
    if (loginResponse.status !== 200) {
      console.error('❌ Parent login failed:', loginResponse.data);
      return;
    }
    
    const parentCookie = loginResponse.headers['set-cookie'] ? loginResponse.headers['set-cookie'][0] : '';
    console.log('✅ Parent logged in:', loginResponse.data);
    
    // 2. Check parent auth status
    console.log('\n2️⃣ Checking parent auth status...');
    const authStatus = await makeRequest('GET', '/api/parent-auth/status', null, parentCookie);
    console.log('Auth status:', authStatus.data);
    
    // 3. Get parent info
    console.log('\n3️⃣ Fetching parent info...');
    const parentInfo = await makeRequest('GET', '/api/parent/info', null, parentCookie);
    console.log('Parent info:', JSON.stringify(parentInfo.data, null, 2));
    
    // 4. Get parent athletes
    console.log('\n4️⃣ Fetching parent athletes...');
    const athletes = await makeRequest('GET', '/api/parent/athletes', null, parentCookie);
    console.log('Athletes found:', athletes.data.length);
    if (athletes.data.length > 0) {
      console.log('Athletes:', JSON.stringify(athletes.data, null, 2));
    } else {
      console.log('❌ No athletes found for this parent!');
    }
    
    // 5. Get parent bookings
    console.log('\n5️⃣ Fetching parent bookings...');
    const bookings = await makeRequest('GET', '/api/parent/bookings', null, parentCookie);
    console.log('Bookings found:', bookings.data.length);
    if (bookings.data.length > 0) {
      console.log('Sample booking:', {
        id: bookings.data[0].id,
        athlete: bookings.data[0].athlete1Name,
        date: bookings.data[0].preferredDate,
        time: bookings.data[0].preferredTime,
        status: bookings.data[0].status
      });
    }
    
    // 6. Verify data consistency
    console.log('\n6️⃣ Verifying data consistency...');
    if (athletes.data.length === 0 && bookings.data.length > 0) {
      console.log('⚠️  ISSUE: Bookings exist but no athletes are displayed!');
      console.log('This suggests athletes are not properly associated with parent ID:', loginResponse.data.parentId);
    } else if (athletes.data.length > 0) {
      console.log('✅ Athletes are properly associated with parent');
    }
    
    // 7. Check admin dashboard for comparison
    console.log('\n7️⃣ Checking admin dashboard for comparison...');
    const adminLogin = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@coachwilltumbles.com',
      password: 'TumbleCoach2025!'
    });
    
    const adminCookie = adminLogin.headers['set-cookie'] ? adminLogin.headers['set-cookie'][0] : '';
    
    const allAthletes = await makeRequest('GET', '/api/athletes', null, adminCookie);
    console.log('Total athletes in system:', allAthletes.data.length);
    if (allAthletes.data.length > 0) {
      console.log('All athletes:', JSON.stringify(allAthletes.data, null, 2));
    }
    
    console.log('\n✅ Test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testParentDashboard();