#!/usr/bin/env node

import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

// Base URL for API requests
const BASE_URL = 'http://localhost:5001';

async function simulateFullBookingFlow() {
  console.log('🔍 Testing complete $0 booking flow from frontend to email...\n');
  
  try {
    // Step 1: Create a parent first (if one doesn't exist)
    console.log('Step 1: Creating/finding test parent...');
    
    const parentData = {
      firstName: 'Test',
      lastName: 'Parent',
      email: 'test@example.com',
      phone: '555-123-4567'
    };
    
    // Try to create a parent (will likely fail if one exists, which is fine)
    let parentId;
    try {
      const parentResponse = await fetch(`${BASE_URL}/api/parents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(parentData)
      });
      
      if (parentResponse.ok) {
        const parent = await parentResponse.json();
        parentId = parent.id;
        console.log('✅ Parent created with ID:', parentId);
      } else {
        // Parent might already exist, let's try to find them
        console.log('  Parent creation failed (likely already exists), continuing...');
        parentId = 1; // Use a default ID for testing
      }
    } catch (error) {
      console.log('  Using default parent ID for testing...');
      parentId = 1;
    }
    
    // Step 2: Create a test booking
    console.log('\nStep 2: Creating test booking...');
    
    // Generate a future date that's likely to be available
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14); // 2 weeks from now
    const dateString = futureDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    
        // Sample booking data for a $0 reservation fee lesson
    const bookingData = {
      lessonTypeId: 1, // Using ID 1 which should be a $0 reservation fee lesson type
      lessonType: 'Free Assessment',
      preferredDate: dateString, // Use dynamic date
      preferredTime: '15:30', // Try a different time
      focusAreaIds: [1],
      parentId: parentId, // Now we have a parent ID
      parentFirstName: 'Test',
      parentLastName: 'Parent',
      parentEmail: 'test@example.com', // Fixed email format
      parentPhone: '555-123-4567',
      // Safety contact info (required)
      dropoffPersonName: 'Test Parent',
      dropoffPersonRelationship: 'Parent',
      dropoffPersonPhone: '555-123-4567',
      pickupPersonName: 'Test Parent',
      pickupPersonRelationship: 'Parent',
      pickupPersonPhone: '555-123-4567',
      // Safety verification
      safetyVerificationSigned: true,
      safetyVerificationSignedAt: new Date().toISOString(),
      // Emergency contact info
      emergencyContactName: 'Emergency Contact',
      emergencyContactPhone: '555-999-8888',
      // Athletes with required fields
      athletes: [
        {
          name: 'Test Child',
          dateOfBirth: '2018-01-01',
          gender: 'female',
          experience: 'beginner',
          slotOrder: 1,
          athleteId: null
        }
      ]
    };
    
    console.log('  Booking payload:', JSON.stringify(bookingData, null, 2));
    
    // Send booking request
    const bookingResponse = await fetch(`${BASE_URL}/api/booking/new-user-flow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookingData)
    });
    
    if (!bookingResponse.ok) {
      const errorText = await bookingResponse.text();
      throw new Error(`Booking creation failed: ${bookingResponse.status} - ${errorText}`);
    }
    
    const booking = await bookingResponse.json();
    console.log('✅ Booking created successfully with ID:', booking.id);
    
    // Step 3: Simulate checkout session creation (this is where $0 bookings send emails)
    console.log('\nStep 3: Creating checkout session for $0 booking...');
    
    const checkoutResponse = await fetch(`${BASE_URL}/api/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bookingId: booking.id
      })
    });
    
    if (!checkoutResponse.ok) {
      const errorText = await checkoutResponse.text();
      throw new Error(`Checkout session creation failed: ${checkoutResponse.status} - ${errorText}`);
    }
    
    const checkoutData = await checkoutResponse.json();
    
    if (checkoutData.skipped) {
      console.log('✅ $0 reservation fee detected - Stripe checkout skipped');
      console.log('  Redirection URL:', checkoutData.url);
      
      // Step 4: Verify email debug logs from terminal output
      console.log('\n✅ Test completed successfully!');
      console.log('\nImportant: Check terminal logs for:');
      console.log('  - [CHECKOUT] ✅ Session confirmation email sent for $0 reservation fee booking');
      console.log('  - [CHECKOUT] ✅ Admin new booking notification sent for $0 reservation fee booking');
      console.log('  - [CHECKOUT-ADMIN-DEBUG] ✅ Admin email result');
    } else {
      console.log('❌ Test failed: This was not processed as a $0 booking');
      console.log('  Checkout data:', JSON.stringify(checkoutData, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the simulation
simulateFullBookingFlow();
