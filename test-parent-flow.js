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

async function testParentFlow() {
  console.log('🧪 Testing Parent Dashboard Flow\n');

  try {
    // 1. Request auth code for parent
    console.log('1️⃣ Requesting auth code for parent...');
    const authCodeResponse = await makeRequest('POST', '/api/parent-auth/request-code', {
      email: 'swyrwilliam12@gmail.com'
    });
    
    console.log('Auth code response:', authCodeResponse.data);
    
    if (authCodeResponse.status !== 200) {
      console.error('Failed to request auth code');
      return;
    }
    
    // 2. Get admin session to fetch the auth code
    console.log('\n2️⃣ Getting admin session to retrieve auth code...');
    const adminLogin = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@coachwilltumbles.com',
      password: 'TumbleCoach2025!'
    });
    
    const adminCookie = adminLogin.headers['set-cookie'] ? adminLogin.headers['set-cookie'][0] : '';
    
    // 3. Create an endpoint to get the auth code from session
    // Since the auth code is stored in session, we need to check it from the same session
    console.log('\n3️⃣ Using hardcoded auth code for testing...');
    // In a real scenario, the code would be sent via email
    // For testing, let's use the admin debug endpoint if available
    
    // 4. Try to verify with a test code (simulating the email code)
    console.log('\n4️⃣ Attempting to verify auth code...');
    // Since we can't get the actual code from the session, let's check if there's a debug endpoint
    
    // First, let's check the parent authentication status
    const parentAuthStatus = await makeRequest('GET', '/api/parent-auth/status');
    console.log('Parent auth status before login:', parentAuthStatus.data);
    
    // 5. Create auth code manually for testing
    console.log('\n5️⃣ Creating test auth code in database...');
    const createAuthCode = await makeRequest('POST', '/api/admin/create-test-auth-code', {
      email: 'swyrwilliam12@gmail.com',
      code: 'TEST123'
    }, adminCookie);
    
    if (createAuthCode.status === 200) {
      // 6. Verify the test auth code
      console.log('\n6️⃣ Verifying test auth code...');
      const verifyResponse = await makeRequest('POST', '/api/parent-auth/verify-code', {
        email: 'swyrwilliam12@gmail.com',
        code: 'TEST123'
      });
      
      if (verifyResponse.status === 200) {
        const parentCookie = verifyResponse.headers['set-cookie'] ? verifyResponse.headers['set-cookie'][0] : '';
        console.log('✅ Parent authenticated successfully!');
        
        // 7. Test parent dashboard endpoints
        console.log('\n7️⃣ Testing parent dashboard endpoints...');
        
        // Get parent info
        const parentInfo = await makeRequest('GET', '/api/parent/info', null, parentCookie);
        console.log('Parent info:', parentInfo.data);
        
        // Get parent athletes
        const parentAthletes = await makeRequest('GET', '/api/parent/athletes', null, parentCookie);
        console.log('\n🏃 Parent athletes:', parentAthletes.data);
        
        // Get parent bookings
        const parentBookings = await makeRequest('GET', '/api/parent/bookings', null, parentCookie);
        console.log('\n📅 Parent bookings count:', parentBookings.data.length);
        if (parentBookings.data.length > 0) {
          console.log('Sample booking:', {
            id: parentBookings.data[0].id,
            athlete: parentBookings.data[0].athlete1Name,
            date: parentBookings.data[0].preferredDate,
            status: parentBookings.data[0].status
          });
        }
        
      } else {
        console.error('Failed to verify auth code:', verifyResponse.data);
      }
    } else {
      // Try direct session login approach
      console.log('\n6️⃣ Alternative: Testing direct parent login...');
      
      // Check if there's a session-based login
      const sessionResponse = await makeRequest('POST', '/api/parent-auth/session-login', {
        email: 'swyrwilliam12@gmail.com'
      }, adminCookie);
      
      if (sessionResponse.status === 200) {
        const parentCookie = sessionResponse.headers['set-cookie'] ? sessionResponse.headers['set-cookie'][0] : '';
        
        // Get parent athletes
        const parentAthletes = await makeRequest('GET', '/api/parent/athletes', null, parentCookie);
        console.log('\n🏃 Parent athletes:', parentAthletes.data);
      }
    }
    
    console.log('\n✅ Test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testParentFlow();