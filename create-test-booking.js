#!/usr/bin/env node
require('dotenv').config();

async function createTestBooking() {
  try {
    const booking = {
      lessonType: "quick-journey",
      preferredDate: "2025-07-20",
      preferredTime: "10:00",
      amount: "40.00",
      focusAreaIds: [1, 2], // General Skills, Basic Skills
      parentFirstName: "Alfred",
      parentLastName: "Sawyer",
      parentEmail: "thomas@sawyersystems.ai",
      parentPhone: "(555) 123-4567",
      emergencyContactName: "Emergency Contact",
      emergencyContactPhone: "(555) 987-6543",
      waiverSigned: true,
      waiverSignedAt: new Date().toISOString(),
      waiverSignatureName: "Alfred Sawyer",
      reservationFeePaid: false,
      athletes: [{
        athleteId: null,
        slotOrder: 1,
        name: "Alfred Jr Sawyer",
        dateOfBirth: "2015-05-15",
        allergies: "None",
        experience: "intermediate",
        gender: "Male"
      }]
    };

    console.log('Creating test booking with data:', JSON.stringify(booking, null, 2));

    const response = await fetch('http://localhost:5001/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(booking)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    const result = await response.json();
    console.log('✅ Test booking created successfully:', {
      id: result.id,
      lessonType: result.lessonType,
      parentEmail: result.parentEmail,
      preferredDate: result.preferredDate,
      preferredTime: result.preferredTime
    });

    // Now create a mock checkout session to simulate Stripe
    const sessionResponse = await fetch('http://localhost:5001/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 40,
        bookingId: result.id,
        isReservationFee: true,
        fullLessonPrice: 40,
        lessonType: "quick-journey"
      })
    });

    if (!sessionResponse.ok) {
      const error = await sessionResponse.text();
      console.error('❌ Failed to create checkout session:', error);
      return;
    }

    const sessionResult = await sessionResponse.json();
    console.log('✅ Checkout session created:', {
      sessionId: sessionResult.sessionId,
      url: sessionResult.url
    });

    // Test the booking-by-session endpoint
    const bookingBySessionResponse = await fetch(`http://localhost:5001/api/booking-by-session/${sessionResult.sessionId}`);
    
    if (!bookingBySessionResponse.ok) {
      const error = await bookingBySessionResponse.text();
      console.error('❌ Failed to get booking by session:', error);
      return;
    }

    const bookingBySession = await bookingBySessionResponse.json();
    console.log('✅ Retrieved booking by session ID:', {
      id: bookingBySession.id,
      sessionId: bookingBySession.stripeSessionId,
      athletes: bookingBySession.athletes?.length || 0
    });

    console.log('\n🎯 Test URLs:');
    console.log(`Booking Success Page: http://localhost:5173/booking-success?session_id=${sessionResult.sessionId}`);
    console.log(`Admin Dashboard: http://localhost:5173/admin`);

  } catch (error) {
    console.error('❌ Error creating test booking:', error.message);
  }
}

createTestBooking();
