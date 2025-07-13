
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';

async function makeRequest(method, endpoint, body = null, cookies = '') {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  return {
    status: response.status,
    data: await response.json().catch(() => null),
    headers: response.headers
  };
}

async function runComprehensiveDiagnostics() {
  console.log('🔍 Starting Comprehensive Parent Authentication Diagnostics\n');
  
  // Step 1: Check server connectivity
  console.log('1️⃣ Testing server connectivity...');
  try {
    const dbTest = await makeRequest('GET', '/api/db-test');
    console.log('   Database connection:', dbTest.status === 200 ? '✅ Connected' : '❌ Failed');
    console.log('   Response:', dbTest.data);
  } catch (error) {
    console.log('   ❌ Server not responding:', error.message);
    return;
  }
  
  // Step 2: Check existing data
  console.log('\n2️⃣ Checking existing data...');
  
  // Get admin session first
  console.log('   Getting admin session...');
  const adminLogin = await makeRequest('POST', '/api/auth/login', {
    email: 'admin@coachwilltumbles.com',
    password: 'admin123'
  });
  
  let adminCookies = '';
  if (adminLogin.status === 200) {
    const setCookie = adminLogin.headers.get('set-cookie');
    if (setCookie) {
      adminCookies = setCookie.split(';')[0];
    }
    console.log('   ✅ Admin login successful');
  } else {
    console.log('   ❌ Admin login failed:', adminLogin.data);
    return;
  }
  
  // Check bookings
  const bookings = await makeRequest('GET', '/api/bookings', null, adminCookies);
  console.log('   Bookings:', bookings.status === 200 ? '✅ Accessible' : '❌ Failed');
  if (bookings.status === 200 && bookings.data) {
    const sawyerBookings = bookings.data.filter(b => 
      b.parentLastName?.toLowerCase().includes('sawyer') ||
      b.athleteLastName?.toLowerCase().includes('sawyer')
    );
    console.log(`   Found ${sawyerBookings.length} Sawyer family bookings`);
    
    sawyerBookings.forEach(booking => {
      console.log(`     - Booking ID: ${booking.id}, Parent: ${booking.parentFirstName} ${booking.parentLastName}, Email: ${booking.parentEmail}`);
      console.log(`       Athlete: ${booking.athleteFirstName} ${booking.athleteLastName}, Date: ${booking.selectedDate}`);
    });
  }
  
  // Check athletes
  const athletes = await makeRequest('GET', '/api/athletes', null, adminCookies);
  console.log('   Athletes:', athletes.status === 200 ? '✅ Accessible' : '❌ Failed');
  if (athletes.status === 200 && athletes.data) {
    const sawyerAthletes = athletes.data.filter(a => 
      a.lastName?.toLowerCase().includes('sawyer')
    );
    console.log(`   Found ${sawyerAthletes.length} Sawyer athletes in database`);
    
    sawyerAthletes.forEach(athlete => {
      console.log(`     - Athlete: ${athlete.firstName} ${athlete.lastName}, Parent Email: ${athlete.parentEmail}`);
    });
  }
  
  // Check parents
  const parents = await makeRequest('GET', '/api/parents', null, adminCookies);
  console.log('   Parents:', parents.status === 200 ? '✅ Accessible' : '❌ Failed');
  if (parents.status === 200 && parents.data) {
    const sawyerParents = parents.data.filter(p => 
      p.lastName?.toLowerCase().includes('sawyer') ||
      p.email?.toLowerCase().includes('sawyer')
    );
    console.log(`   Found ${sawyerParents.length} Sawyer parents in database`);
    
    sawyerParents.forEach(parent => {
      console.log(`     - Parent: ${parent.firstName} ${parent.lastName}, Email: ${parent.email}`);
    });
  }
  
  // Step 3: Test parent authentication
  console.log('\n3️⃣ Testing parent authentication...');
  
  if (bookings.status === 200 && bookings.data) {
    const testEmail = 'thomas.sawyer@example.com'; // Adjust based on actual data
    const sawyerBooking = bookings.data.find(b => 
      b.parentEmail?.toLowerCase().includes('thomas') ||
      b.parentEmail?.toLowerCase().includes('sawyer')
    );
    
    if (sawyerBooking) {
      const testEmailToUse = sawyerBooking.parentEmail;
      console.log(`   Testing with email: ${testEmailToUse}`);
      
      // Test sending code
      const sendCode = await makeRequest('POST', '/api/parent-auth/send-code', {
        email: testEmailToUse
      });
      console.log('   Send code:', sendCode.status === 200 ? '✅ Success' : '❌ Failed');
      console.log('   Response:', sendCode.data);
      
      if (sendCode.status === 200) {
        // We can't test the actual code verification without the email code
        // But we can check if the session endpoints work
        const authStatus = await makeRequest('GET', '/api/parent-auth/status');
        console.log('   Auth status check:', authStatus.status === 200 ? '✅ Accessible' : '❌ Failed');
        console.log('   Status response:', authStatus.data);
      }
    } else {
      console.log('   ❌ No Sawyer booking found for testing');
    }
  }
  
  // Step 4: Run fix missing athletes
  console.log('\n4️⃣ Running fix missing athletes...');
  const fixAthletes = await makeRequest('POST', '/api/fix-missing-athletes', null, adminCookies);
  console.log('   Fix missing athletes:', fixAthletes.status === 200 ? '✅ Success' : '❌ Failed');
  console.log('   Response:', fixAthletes.data);
  
  // Step 5: Re-check athletes after fix
  console.log('\n5️⃣ Re-checking athletes after fix...');
  const athletesAfter = await makeRequest('GET', '/api/athletes', null, adminCookies);
  if (athletesAfter.status === 200 && athletesAfter.data) {
    const sawyerAthletesAfter = athletesAfter.data.filter(a => 
      a.lastName?.toLowerCase().includes('sawyer')
    );
    console.log(`   Found ${sawyerAthletesAfter.length} Sawyer athletes after fix`);
  }
  
  console.log('\n🎯 Diagnostic Summary:');
  console.log('- Check if Alfred Sawyer appears in admin Athletes tab');
  console.log('- Test Thomas Sawyer login with parent authentication');
  console.log('- Verify email codes are being sent and stored properly');
  console.log('- Ensure parent and athlete profiles are created from bookings');
}

runComprehensiveDiagnostics().catch(console.error);
