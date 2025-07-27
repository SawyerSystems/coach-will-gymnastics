require('dotenv').config();

async function debugBookingsResponse() {
  console.log('🧪 Debugging bookings response structure...');
  
  try {
    // Login first
    const loginResponse = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@coachwilltumbles.com',
        password: 'TumbleCoach2025!'
      })
    });
    
    const cookies = loginResponse.headers.get('set-cookie');
    
    // Get active bookings
    const activeResponse = await fetch('http://localhost:5001/api/bookings', {
      headers: { 'Cookie': cookies }
    });
    
    const activeBookings = await activeResponse.json();
    console.log(`\n📊 Active bookings count: ${activeBookings.length}`);
    
    if (activeBookings.length > 0) {
      console.log('\n📋 First active booking structure:');
      const firstBooking = activeBookings[0];
      console.log('Keys:', Object.keys(firstBooking));
      console.log('ID:', firstBooking.id);
      console.log('Status:', firstBooking.status);
      console.log('Attendance Status:', firstBooking.attendanceStatus);
      console.log('Payment Status:', firstBooking.paymentStatus);
      console.log('Has Athletes?:', !!firstBooking.athletes);
      console.log('Athletes count:', firstBooking.athletes?.length || 0);
      console.log('Has LessonType?:', !!firstBooking.lessonType);
      console.log('Preferred Date:', firstBooking.preferredDate);
      console.log('Preferred Time:', firstBooking.preferredTime);
    }
    
    // Get archived bookings
    const archivedResponse = await fetch('http://localhost:5001/api/archived-bookings', {
      headers: { 'Cookie': cookies }
    });
    
    const archivedBookings = await archivedResponse.json();
    console.log(`\n📦 Archived bookings count: ${archivedBookings.length}`);
    
    if (archivedBookings.length > 0) {
      console.log('\n📋 First archived booking structure:');
      const firstArchived = archivedBookings[0];
      console.log('ID:', firstArchived.id);
      console.log('Status:', firstArchived.status);
      console.log('Attendance Status:', firstArchived.attendanceStatus);
    }
    
    console.log('\n✅ Response structure debug complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugBookingsResponse();
