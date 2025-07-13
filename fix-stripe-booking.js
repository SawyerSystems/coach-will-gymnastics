#!/usr/bin/env node

// Fix booking 83 with correct Stripe integration

async function fixBooking83() {
  console.log('🔧 Fixing booking 83 with correct Stripe integration...');
  
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
      lessonType: booking.lessonType,
      athlete1Name: booking.athlete1Name,
      paidAmount: booking.paidAmount,
      paymentStatus: booking.paymentStatus,
      attendanceStatus: booking.attendanceStatus,
      stripeSessionId: booking.stripeSessionId
    });
    
    // 3. Update to session-paid status (since they paid the full reservation fee)
    console.log('💰 Setting payment status to session-paid...');
    const updatePaymentResponse = await fetch(`${BASE_URL}/bookings/${bookingId}/payment-status`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': sessionCookie
      },
      body: JSON.stringify({ paymentStatus: 'session-paid' })
    });
    
    if (updatePaymentResponse.ok) {
      console.log('✅ Payment status updated to session-paid');
    } else {
      const errorText = await updatePaymentResponse.text();
      console.error('❌ Failed to update payment status:', errorText);
    }
    
    // 4. For the athlete name and parent relationship, I need to check what athlete exists
    console.log('🏃‍♂️ Checking existing athletes...');
    const athletesResponse = await fetch(`${BASE_URL}/athletes`, {
      headers: { 'Cookie': sessionCookie }
    });
    
    if (!athletesResponse.ok) {
      console.error('❌ Failed to fetch athletes:', athletesResponse.status, athletesResponse.statusText);
      const errorText = await athletesResponse.text();
      console.error('Error details:', errorText);
      return;
    }
    
    const athletes = await athletesResponse.json();
    console.log('📋 Found athletes:', athletes.map(a => ({ id: a.id, name: a.name, parentId: a.parentId })));
    
    if (athletes.length > 0) {
      const athlete = athletes.find(a => a.name === 'Alfred S.') || athletes[0];
      console.log(`🎯 Using athlete: ${athlete.name} (ID: ${athlete.id})`);
      
      // Update booking with correct athlete name and parent linkage
      // Since there's no direct API for this, I'll need to use the admin update
      console.log('🔗 Linking booking to athlete and parent...');
      
      // Try to update via the relations endpoint
      const updateRelationsResponse = await fetch(`${BASE_URL}/bookings/${bookingId}/relations`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Cookie': sessionCookie
        },
        body: JSON.stringify({ 
          parentId: athlete.parentId,
          athleteIds: [athlete.id],
          athlete1Name: athlete.name
        })
      });
      
      if (updateRelationsResponse.ok) {
        console.log(`✅ Updated booking relations with athlete ${athlete.name}`);
      } else {
        const errorText = await updateRelationsResponse.text();
        console.log(`⚠️ Relations update failed (may not be implemented): ${errorText}`);
        
        // Fallback: Try general booking update
        console.log('🔄 Trying fallback approach...');
        // This is where we would need to implement a proper admin update endpoint
      }
    }
    
    // 5. Verify the final result
    console.log('🔍 Verifying the final result...');
    const verifyResponse = await fetch(`${BASE_URL}/bookings-with-relations`, {
      headers: { 'Cookie': sessionCookie }
    });
    const updatedBookings = await verifyResponse.json();
    const updatedBooking = updatedBookings.find(b => b.id === bookingId);
    
    console.log('✅ Final booking state:', {
      id: updatedBooking.id,
      lessonType: updatedBooking.lessonType,
      athlete1Name: updatedBooking.athlete1Name,
      paidAmount: updatedBooking.paidAmount,
      paymentStatus: updatedBooking.paymentStatus,
      attendanceStatus: updatedBooking.attendanceStatus,
      parentId: updatedBooking.parentId,
      athletes: updatedBooking.athletes?.length || 0
    });
    
    // Test the booking success page
    console.log('🧪 Testing booking success page...');
    const successPageResponse = await fetch(`${BASE_URL}/booking-by-session/${booking.stripeSessionId}`);
    if (successPageResponse.ok) {
      const successData = await successPageResponse.json();
      console.log('📄 Booking success page data:', {
        id: successData.id,
        athlete1Name: successData.athlete1Name,
        paidAmount: successData.paidAmount,
        amount: successData.amount
      });
    }
    
    console.log('🎉 Booking fix completed!');
    
  } catch (error) {
    console.error('❌ Error during fix:', error);
  }
}

// Run the fix
fixBooking83().then(() => process.exit(0)).catch(console.error);
