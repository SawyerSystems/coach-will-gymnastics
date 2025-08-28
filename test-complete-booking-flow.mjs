#!/usr/bin/env node

import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

// Base URL for API requests
const BASE_URL = 'http://localhost:5001';

// Create Supabase client for direct database access
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function simulateFullBookingFlow() {
  console.log('🔍 Testing complete $0 booking flow with direct database access...\n');
  
  try {
    // Step 1: Create a temporary parent directly in the database
    console.log('Step 1: Creating temporary parent record...');
    
    const parentData = {
      first_name: 'Test',
      last_name: 'Parent',
      email: 'test@example.com',
      phone: '555-123-4567',
      is_verified: true,
      emergency_contact_name: 'Emergency Contact',
      emergency_contact_phone: '555-999-8888',
      password_hash: 'test-dummy-password-hash',
      blog_emails: false
    };
    
    const { data: parent, error: parentError } = await supabase
      .from('parents')
      .insert(parentData)
      .select()
      .single();
    
    if (parentError) {
      throw new Error(`Failed to create parent: ${parentError.message}`);
    }
    
    console.log(`✅ Parent created with ID: ${parent.id}`);
    
    // Step 2: Create a booking using the parent ID
    console.log('\nStep 2: Creating test booking...');
    
    // Sample booking data for a $0 reservation fee lesson
    const bookingData = {
      lessonTypeId: 1, // Using ID 1 which should be a $0 reservation fee lesson type
      lessonType: 'Free Assessment',
      preferredDate: '2025-09-15',
      preferredTime: '14:00',
      focusAreaIds: [1],
      // Use the created parent ID
      parentId: parent.id,
      parentFirstName: parent.first_name,
      parentLastName: parent.last_name,
      parentEmail: parent.email,
      parentPhone: parent.phone,
      // Safety contact info (required)
      dropoffPersonName: `${parent.first_name} ${parent.last_name}`,
      dropoffPersonRelationship: 'Parent',
      dropoffPersonPhone: parent.phone,
      pickupPersonName: `${parent.firstName} ${parent.lastName}`,
      pickupPersonRelationship: 'Parent',
      pickupPersonPhone: parent.phone,
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
    const bookingResponse = await fetch(`${BASE_URL}/api/bookings`, {
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
      
      // Step 4: Check if emails were sent
      console.log('\nStep 4: Verifying booking was confirmed and emails were sent...');
      
      // Fetch the booking to see if it was updated
      const { data: updatedBooking, error: bookingError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', booking.id)
        .single();
      
      if (bookingError) {
        console.error('❌ Failed to fetch updated booking:', bookingError.message);
      } else {
        console.log('Updated booking status:', updatedBooking.status);
        console.log('Updated payment status:', updatedBooking.paymentStatus);
        
        if (updatedBooking.status === 'confirmed' && updatedBooking.paymentStatus === 'reservation-paid') {
          console.log('✅ Booking was successfully confirmed and marked as paid!');
          console.log('\n📧 Emails should have been sent to:');
          console.log(`  - Parent: ${parent.email}`);
          console.log(`  - Admin: ${process.env.ADMIN_EMAIL || 'admin@coachwilltumbles.com'}`);
        } else {
          console.log('❌ Booking was not properly confirmed or marked as paid');
        }
      }
      
      // Step 5: Summary
      console.log('\n📝 Test Summary:');
      console.log('  1. Parent created successfully');
      console.log('  2. Booking created successfully');
      console.log('  3. Checkout session created successfully with $0 fee (skipped Stripe)');
      console.log('  4. Check terminal logs for confirmation emails were sent');
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
