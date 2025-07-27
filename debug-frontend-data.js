import fetch from 'node-fetch';

async function debugFrontendData() {
  try {
    console.log('🔍 Debugging frontend data transformation...');
    
    // Login first
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
    console.log('✅ Login successful:', loginData.success);
    
    // Get session cookie
    const setCookieHeader = loginResponse.headers.raw()['set-cookie'];
    const sessionCookie = setCookieHeader ? setCookieHeader[0] : '';
    
    // Get bookings data
    const bookingsResponse = await fetch('http://localhost:5001/api/parent/bookings', {
      headers: {
        'Cookie': sessionCookie
      }
    });
    
    const bookingsData = await bookingsResponse.json();
    console.log('\n📊 Raw bookings data from API:');
    console.log('Number of bookings:', bookingsData.length);
    
    bookingsData.forEach((booking, index) => {
      console.log(`\n📋 Booking ${index + 1}:`);
      console.log(`  ID: ${booking.id}`);
      console.log(`  Status: ${booking.status}`);
      console.log(`  Payment Status: ${booking.payment_status || booking.paymentStatus}`);
      console.log(`  Attendance Status (snake_case): ${booking.attendance_status}`);
      console.log(`  Attendance Status (camelCase): ${booking.attendanceStatus}`);
      console.log(`  Created: ${booking.created_at || booking.createdAt}`);
      console.log(`  Athletes: ${booking.athletes?.length || 0} athletes`);
      if (booking.athletes?.length > 0) {
        console.log(`    - ${booking.athletes[0].name}`);
      }
    });
    
    console.log('\n🎯 Adventure Log Filter Test:');
    const pastBookings = bookingsData.filter(b => {
      console.log(`  Booking ${b.id}: attendanceStatus='${b.attendanceStatus}', attendance_status='${b.attendance_status}'`);
      return b.attendanceStatus === 'completed';
    });
    console.log(`📈 Adventure Log would show ${pastBookings.length} bookings`);
    
    // Also test with snake_case
    const pastBookingsSnake = bookingsData.filter(b => b.attendance_status === 'completed');
    console.log(`📈 With snake_case filter: ${pastBookingsSnake.length} bookings`);
    
    console.log('\n✅ Debug completed');
    
  } catch (error) {
    console.error('💥 Debug failed:', error);
  }
}

debugFrontendData();
