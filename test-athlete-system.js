// Test Athlete System
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

async function testAthleteSystem() {
  console.log('🧪 Testing Athlete System Post-Supabase Migration\n');

  try {
    // 1. First, test admin login
    console.log('1️⃣ Testing Admin Login...');
    const adminLogin = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@coachwilltumbles.com',
      password: 'TumbleCoach2025!'
    });

    if (adminLogin.status !== 200) {
      console.error('❌ Admin login failed:', adminLogin.data);
      return;
    }

    // Extract session cookie
    const setCookieHeader = adminLogin.headers['set-cookie'];
    const sessionCookie = setCookieHeader ? setCookieHeader[0] : '';
    console.log('✅ Admin logged in successfully\n');

    // 2. Check existing athletes
    console.log('2️⃣ Checking existing athletes in database...');
    const athletesResponse = await makeRequest('GET', '/api/athletes', null, sessionCookie);
    console.log(`Athletes found: ${athletesResponse.data.length}`);
    if (athletesResponse.data.length > 0) {
      console.log('Sample athlete:', JSON.stringify(athletesResponse.data[0], null, 2));
    }
    console.log('');

    // 3. Check existing parents
    console.log('3️⃣ Checking existing parents...');
    const parentsResponse = await makeRequest('GET', '/api/parents', null, sessionCookie);
    console.log(`Parents found: ${parentsResponse.data.length}`);
    if (parentsResponse.data.length > 0) {
      console.log('Sample parent:', JSON.stringify(parentsResponse.data[0], null, 2));
    }
    console.log('');

    // 4. Check existing bookings
    console.log('4️⃣ Checking existing bookings...');
    const bookingsResponse = await makeRequest('GET', '/api/bookings', null, sessionCookie);
    console.log(`Bookings found: ${bookingsResponse.data.length}`);
    if (bookingsResponse.data.length > 0) {
      const booking = bookingsResponse.data[0];
      console.log('Sample booking:', {
        id: booking.id,
        athleteName: booking.athlete1Name,
        parentEmail: booking.parentEmail,
        date: booking.preferredDate,
        status: booking.status
      });
    }
    console.log('');

    // 5. Test parent authentication flow
    console.log('5️⃣ Testing parent authentication flow...');
    
    // First, try to identify a parent from existing bookings
    if (bookingsResponse.data.length > 0) {
      const testBooking = bookingsResponse.data[0];
      
      console.log(`Testing with parent email: ${testBooking.parentEmail}`);
      
      // Request auth code
      const authCodeResponse = await makeRequest('POST', '/api/parent-auth/request-code', {
        email: testBooking.parentEmail
      });
      
      console.log('Auth code request response:', authCodeResponse.data);
      
      // Now check if we can find the auth code in the database
      const authCodesResponse = await makeRequest('GET', '/api/parent-auth/debug-codes', null, sessionCookie);
      console.log('Auth codes in database:', authCodesResponse.data);
    }
    console.log('');

    // 6. Test parent dashboard athlete fetching
    console.log('6️⃣ Testing parent dashboard athlete fetching...');
    
    // First, let's simulate a parent login
    if (parentsResponse.data.length > 0) {
      const testParent = parentsResponse.data[0];
      
      // Request auth code for this parent
      const authCodeReq = await makeRequest('POST', '/api/parent-auth/request-code', {
        email: testParent.email
      });
      
      if (authCodeReq.status === 200) {
        // Get the auth code from debug endpoint
        const codes = await makeRequest('GET', '/api/parent-auth/debug-codes', null, sessionCookie);
        const authCode = codes.data.find(c => c.email === testParent.email)?.code;
        
        if (authCode) {
          // Verify the auth code
          const verifyResponse = await makeRequest('POST', '/api/parent-auth/verify-code', {
            email: testParent.email,
            code: authCode
          });
          
          if (verifyResponse.status === 200) {
            const parentSessionCookie = verifyResponse.headers['set-cookie'] ? verifyResponse.headers['set-cookie'][0] : '';
            
            // Now fetch athletes as the parent
            const parentAthletesResponse = await makeRequest('GET', '/api/parent/athletes', null, parentSessionCookie);
            console.log('Parent athletes response:', parentAthletesResponse.data);
            
            // Also check parent bookings
            const parentBookingsResponse = await makeRequest('GET', '/api/parent/bookings', null, parentSessionCookie);
            console.log('Parent bookings count:', parentBookingsResponse.data.length);
          }
        }
      }
    }
    console.log('');

    // 7. Test athlete creation from bookings
    console.log('7️⃣ Testing athlete creation from bookings...');
    const athleteFixResponse = await makeRequest('POST', '/api/admin/fix-parent-athletes', {}, sessionCookie);
    console.log('Athlete fix response:', JSON.stringify(athleteFixResponse.data, null, 2));

    console.log('\n✅ Test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testAthleteSystem();