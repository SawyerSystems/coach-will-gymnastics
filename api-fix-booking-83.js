#!/usr/bin/env node

// Manual fix for booking 83 via API calls

async function fixBooking83() {
  console.log('🔧 Manual webhook fix for booking ID 83 via API...');
  
  const BASE_URL = 'http://localhost:5001/api';
  const bookingId = 83;
  
  try {
    // 1. Get current booking data
    console.log('📋 Getting current booking data...');
    const response = await fetch(`${BASE_URL}/bookings-with-relations`);
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
      parentEmail: booking.parentEmail
    });
    
    // 2. Update payment status to reservation-paid
    console.log('💰 Updating payment status...');
    const updatePaymentResponse = await fetch(`${BASE_URL}/booking/${bookingId}/payment-status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentStatus: 'reservation-paid' })
    });
    
    if (updatePaymentResponse.ok) {
      console.log('✅ Payment status updated to reservation-paid');
    } else {
      console.error('❌ Failed to update payment status');
    }
    
    // 3. Update attendance status to confirmed  
    console.log('📅 Updating attendance status...');
    const updateAttendanceResponse = await fetch(`${BASE_URL}/booking/${bookingId}/attendance-status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attendanceStatus: 'confirmed' })
    });
    
    if (updateAttendanceResponse.ok) {
      console.log('✅ Attendance status updated to confirmed');
    } else {
      console.error('❌ Failed to update attendance status');
    }
    
    // 4. Update paid amount to $40 (Quick Journey price)
    console.log('💵 Updating paid amount...');
    
    // We'll need to use the general booking update endpoint
    const updateBookingResponse = await fetch(`${BASE_URL}/booking/${bookingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        paidAmount: "40.00",
        reservationFeePaid: true,
        athlete1Name: "Alfred S." // Set a real athlete name
      })
    });
    
    if (updateBookingResponse.ok) {
      console.log('✅ Paid amount updated to $40.00 and athlete name set');
    } else {
      console.error('❌ Failed to update booking details');
      const errorText = await updateBookingResponse.text();
      console.error('Error:', errorText);
    }
    
    // 5. Verify the changes
    console.log('🔍 Verifying the fix...');
    const verifyResponse = await fetch(`${BASE_URL}/bookings-with-relations`);
    const updatedBookings = await verifyResponse.json();
    const updatedBooking = updatedBookings.find(b => b.id === bookingId);
    
    console.log('✅ Final booking state:', {
      id: updatedBooking.id,
      athlete1Name: updatedBooking.athlete1Name,
      paidAmount: updatedBooking.paidAmount,
      paymentStatus: updatedBooking.paymentStatus,
      attendanceStatus: updatedBooking.attendanceStatus,
      parentId: updatedBooking.parentId,
      athletes: updatedBooking.athletes?.length || 0
    });
    
    console.log('🎉 Manual API fix completed!');
    
  } catch (error) {
    console.error('❌ Error during manual fix:', error);
  }
}

// Run the fix
fixBooking83().then(() => process.exit(0)).catch(console.error);
