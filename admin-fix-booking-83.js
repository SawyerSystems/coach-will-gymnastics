#!/usr/bin/env node

// Authenticated admin fix for booking 83

async function fixBooking83WithAuth() {
  console.log('🔧 Authenticated admin fix for booking ID 83...');
  
  const BASE_URL = 'http://localhost:5001/api';
  const bookingId = 83;
  
  try {
    // 1. Login as admin
    console.log('🔐 Logging in as admin...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@coachwilltumbles.com',
        password: 'TumbleCoach2025!'
      })
    });
    
    if (!loginResponse.ok) {
      console.error('❌ Failed to login as admin');
      return;
    }
    
    // Extract session cookie
    const setCookieHeader = loginResponse.headers.get('set-cookie');
    const sessionCookie = setCookieHeader ? setCookieHeader.split(';')[0] : '';
    
    console.log('✅ Admin login successful');
    
    // 2. Get current booking data
    console.log('📋 Getting current booking data...');
    const response = await fetch(`${BASE_URL}/bookings-with-relations`, {
      headers: { 'Cookie': sessionCookie }
    });
    const bookings = await response.json();
    const booking = bookings.find(b => b.id === bookingId);
    
    if (!booking) {
      console.error('❌ Booking 83 not found');
      return;
    }
    
    console.log('Current booking:', {
      id: booking.id,
      athlete1Name: booking.athlete1Name,
      paidAmount: booking.paidAmount,
      paymentStatus: booking.paymentStatus,
      attendanceStatus: booking.attendanceStatus
    });
    
    // 3. Update payment status to reservation-paid
    console.log('💰 Updating payment status...');
    const updatePaymentResponse = await fetch(`${BASE_URL}/bookings/${bookingId}/payment-status`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': sessionCookie
      },
      body: JSON.stringify({ paymentStatus: 'reservation-paid' })
    });
    
    if (updatePaymentResponse.ok) {
      console.log('✅ Payment status updated to reservation-paid');
    } else {
      const errorText = await updatePaymentResponse.text();
      console.error('❌ Failed to update payment status:', errorText);
    }
    
    // 4. Update attendance status to confirmed  
    console.log('📅 Updating attendance status...');
    const updateAttendanceResponse = await fetch(`${BASE_URL}/bookings/${bookingId}/attendance-status`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': sessionCookie
      },
      body: JSON.stringify({ attendanceStatus: 'confirmed' })
    });
    
    if (updateAttendanceResponse.ok) {
      console.log('✅ Attendance status updated to confirmed');
    } else {
      const errorText = await updateAttendanceResponse.text();
      console.error('❌ Failed to update attendance status:', errorText);
    }
    
    // 5. For updating paid amount and athlete name, I need to directly update the database
    // Let me try a different approach - check if there's a direct admin update endpoint
    
    console.log('💵 Trying to update paid amount via direct database call...');
    
    // Since we don't have a direct endpoint for updating these fields,
    // let me try to simulate what the webhook should have done by 
    // manually calling the database update
    
    // For now, let's verify if our status updates worked
    console.log('🔍 Verifying the status updates...');
    const verifyResponse = await fetch(`${BASE_URL}/bookings-with-relations`, {
      headers: { 'Cookie': sessionCookie }
    });
    const updatedBookings = await verifyResponse.json();
    const updatedBooking = updatedBookings.find(b => b.id === bookingId);
    
    console.log('Status updates result:', {
      id: updatedBooking.id,
      athlete1Name: updatedBooking.athlete1Name,
      paidAmount: updatedBooking.paidAmount,
      paymentStatus: updatedBooking.paymentStatus,
      attendanceStatus: updatedBooking.attendanceStatus,
      parentId: updatedBooking.parentId
    });
    
    console.log('✅ Status updates completed! Now let me manually fix the database records...');
    
  } catch (error) {
    console.error('❌ Error during authenticated fix:', error);
  }
}

// Run the fix
fixBooking83WithAuth().then(() => {
  console.log('✅ Admin fix script completed. Next step: manual database updates for paidAmount and athlete relationships.');
}).catch(console.error);
