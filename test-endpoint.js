import fetch from 'node-fetch';

async function testParentBookingsEndpoint() {
  try {
    console.log('🧪 Testing /api/parent/bookings endpoint...');
    
    // First login to get a session
    const loginResponse = await fetch('http://localhost:5001/api/parent-auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'swyrwilliam12@gmail.com',
        password: 'parent123!'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('🔐 Login response:', loginData);
    
    // Extract session cookie
    const setCookieHeader = loginResponse.headers.raw()['set-cookie'];
    const sessionCookie = setCookieHeader ? setCookieHeader[0] : '';
    console.log('🍪 Session cookie:', sessionCookie);
    
    // Now call the bookings endpoint
    const bookingsResponse = await fetch('http://localhost:5001/api/parent/bookings', {
      headers: {
        'Cookie': sessionCookie
      }
    });
    
    const bookingsData = await bookingsResponse.json();
    console.log('📊 Bookings response status:', bookingsResponse.status);
    console.log('📊 Bookings data:', bookingsData);
    
    console.log('✅ Test completed');
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

testParentBookingsEndpoint();
