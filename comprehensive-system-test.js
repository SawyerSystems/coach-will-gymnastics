import http from 'http';

async function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ 
            ...parsed, 
            statusCode: res.statusCode, 
            cookies: res.headers['set-cookie'] || []
          });
        } catch (e) {
          resolve({ 
            error: 'Invalid JSON', 
            raw: responseData, 
            statusCode: res.statusCode,
            cookies: res.headers['set-cookie'] || []
          });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function testSystemComprehensively() {
  console.log('🧪 COMPREHENSIVE COACH WILL TUMBLES SYSTEM TEST\n');
  let testResults = [];

  // Test 1: Admin Authentication
  console.log('TEST 1: Admin Authentication');
  const adminLoginData = JSON.stringify({
    email: 'admin@coachwilltumbles.com',
    password: 'TumbleCoach2025!'
  });

  const adminLogin = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(adminLoginData)
    }
  }, adminLoginData);

  if (adminLogin.success) {
    console.log('✅ Admin login successful');
    testResults.push('Admin Authentication: PASS');
  } else {
    console.log('❌ Admin login failed:', adminLogin);
    testResults.push('Admin Authentication: FAIL');
  }

  // Test 2: Parent Authentication Flow
  console.log('\nTEST 2: Parent Authentication Flow');
  const parentAuthData = JSON.stringify({
    email: 'swyrwilliam12@gmail.com'
  });

  const parentAuth = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/parent-auth/request-code',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(parentAuthData)
    }
  }, parentAuthData);

  if (parentAuth.success) {
    console.log('✅ Parent authentication code request successful');
    console.log(`📧 Code sent to ${parentAuth.parentName}`);
    testResults.push('Parent Authentication: PASS');
  } else {
    console.log('❌ Parent authentication failed:', parentAuth);
    testResults.push('Parent Authentication: FAIL');
  }

  // Test 3: Booking Data Integrity
  console.log('\nTEST 3: Booking Data Integrity');
  const bookingsResponse = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/bookings',
    method: 'GET',
    headers: {
      'Cookie': adminLogin.cookies.join('; ')
    }
  });

  if (bookingsResponse.statusCode === 200 && Array.isArray(bookingsResponse)) {
    console.log(`✅ Bookings endpoint accessible - ${bookingsResponse.length} bookings found`);
    if (bookingsResponse.length > 0) {
      const alfredBooking = bookingsResponse.find(b => b.athlete1Name === 'Alfred Sawyer');
      if (alfredBooking) {
        console.log('✅ Alfred Sawyer booking found');
        console.log(`   - Parent: ${alfredBooking.parentFirstName} ${alfredBooking.parentLastName}`);
        console.log(`   - Email: ${alfredBooking.parentEmail}`);
        console.log(`   - Status: ${alfredBooking.status}`);
      }
    }
    testResults.push('Booking Data Integrity: PASS');
  } else {
    console.log('❌ Bookings data issue:', bookingsResponse);
    testResults.push('Booking Data Integrity: FAIL');
  }

  // Test 4: Athletes Data
  console.log('\nTEST 4: Athletes Data');
  const athletesResponse = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/athletes',
    method: 'GET',
    headers: {
      'Cookie': adminLogin.cookies.join('; ')
    }
  });

  if (athletesResponse.statusCode === 200 && Array.isArray(athletesResponse)) {
    console.log(`✅ Athletes endpoint accessible - ${athletesResponse.length} athletes found`);
    const alfredAthlete = athletesResponse.find(a => a.firstName === 'Alfred' && a.lastName === 'Sawyer');
    if (alfredAthlete) {
      console.log('✅ Alfred Sawyer athlete profile found');
      console.log(`   - ID: ${alfredAthlete.id}`);
      console.log(`   - Parent ID: ${alfredAthlete.parentId}`);
      console.log(`   - Date of Birth: ${alfredAthlete.dateOfBirth}`);
    }
    testResults.push('Athletes Data: PASS');
  } else {
    console.log('❌ Athletes data issue:', athletesResponse);
    testResults.push('Athletes Data: FAIL');
  }

  // Test 5: Parents Data
  console.log('\nTEST 5: Parents Data');
  const parentsResponse = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/parents',
    method: 'GET',
    headers: {
      'Cookie': adminLogin.cookies.join('; ')
    }
  });

  if (parentsResponse.statusCode === 200 && Array.isArray(parentsResponse)) {
    console.log(`✅ Parents endpoint accessible - ${parentsResponse.length} parents found`);
    const thomasParent = parentsResponse.find(p => p.email === 'swyrwilliam12@gmail.com');
    if (thomasParent) {
      console.log('✅ Thomas Sawyer parent profile found');
      console.log(`   - ID: ${thomasParent.id}`);
      console.log(`   - Name: ${thomasParent.firstName} ${thomasParent.lastName}`);
    }
    testResults.push('Parents Data: PASS');
  } else {
    console.log('❌ Parents data issue:', parentsResponse);
    testResults.push('Parents Data: FAIL');
  }

  // Test 6: Stripe Integration
  console.log('\nTEST 6: Stripe Products Integration');
  const stripeResponse = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/stripe/products',
    method: 'GET'
  });

  if (stripeResponse.object === 'list' && stripeResponse.data && stripeResponse.data.length > 0) {
    console.log(`✅ Stripe products loaded - ${stripeResponse.data.length} products available`);
    stripeResponse.data.forEach(product => {
      console.log(`   - ${product.name}: $${(product.default_price?.unit_amount || 0) / 100}`);
    });
    testResults.push('Stripe Integration: PASS');
  } else {
    console.log('❌ Stripe products issue:', stripeResponse);
    testResults.push('Stripe Integration: FAIL');
  }

  // Test 7: Content Management
  console.log('\nTEST 7: Content Management System');
  const contentResponse = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/site-content',
    method: 'GET'
  });

  if (contentResponse.statusCode === 200 && contentResponse.about) {
    console.log('✅ Site content accessible');
    console.log(`   - Contact Phone: ${contentResponse.contact?.phone}`);
    console.log(`   - Location: ${contentResponse.contact?.address?.name}`);
    testResults.push('Content Management: PASS');
  } else {
    console.log('❌ Site content issue:', contentResponse);
    testResults.push('Content Management: FAIL');
  }

  // Test 8: Blog Posts
  console.log('\nTEST 8: Blog Posts');
  const blogResponse = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/blog-posts',
    method: 'GET'
  });

  if (blogResponse.statusCode === 200 && Array.isArray(blogResponse)) {
    console.log(`✅ Blog posts accessible - ${blogResponse.length} posts found`);
    testResults.push('Blog Posts: PASS');
  } else {
    console.log('❌ Blog posts issue:', blogResponse);
    testResults.push('Blog Posts: FAIL');
  }

  // Test 9: Tips
  console.log('\nTEST 9: Tips');
  const tipsResponse = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/tips',
    method: 'GET'
  });

  if (tipsResponse.statusCode === 200 && Array.isArray(tipsResponse)) {
    console.log(`✅ Tips accessible - ${tipsResponse.length} tips found`);
    testResults.push('Tips: PASS');
  } else {
    console.log('❌ Tips issue:', tipsResponse);
    testResults.push('Tips: FAIL');
  }

  // Test Summary
  console.log('\n🏁 COMPREHENSIVE TEST RESULTS');
  console.log('================================');
  testResults.forEach(result => console.log(result));
  
  const passCount = testResults.filter(r => r.includes('PASS')).length;
  const totalTests = testResults.length;
  
  console.log(`\n📊 OVERALL: ${passCount}/${totalTests} tests passed`);
  
  if (passCount === totalTests) {
    console.log('🎉 ALL SYSTEMS OPERATIONAL');
  } else {
    console.log('⚠️  Some systems need attention');
  }
}

testSystemComprehensively().catch(console.error);