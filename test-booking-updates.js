// Test script to validate booking status update fixes
const testBookingStatusUpdates = async () => {
  console.log('🧪 Testing booking status update functionality...');
  
  try {
    // Test payment status update
    const paymentResponse = await fetch('http://localhost:5001/api/bookings/83/payment-status', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'cwt.sid.dev=test-admin-session' // This would be a real admin session
      },
      body: JSON.stringify({ paymentStatus: 'reservation-paid' })
    });
    
    console.log('Payment status update response status:', paymentResponse.status);
    
    // Test attendance status update  
    const attendanceResponse = await fetch('http://localhost:5001/api/bookings/83/attendance-status', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'cwt.sid.dev=test-admin-session'
      },
      body: JSON.stringify({ attendanceStatus: 'confirmed' })
    });
    
    console.log('Attendance status update response status:', attendanceResponse.status);
    
  } catch (error) {
    console.error('Test error:', error);
  }
};

// Run the test
testBookingStatusUpdates();
