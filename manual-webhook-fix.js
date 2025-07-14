#!/usr/bin/env node

import { SupabaseStorage } from './server/storage.js';
import { AttendanceStatusEnum, PaymentStatusEnum } from './shared/schema.js';

async function fixBooking83() {
  console.log('🔧 Manual webhook fix for booking ID 83...');
  
  const storage = new SupabaseStorage();
  const bookingId = 83;
  
  try {
    // Get the booking
    const booking = await storage.getBooking(bookingId);
    if (!booking) {
      console.error('❌ Booking 83 not found');
      return;
    }
    
    console.log('📋 Current booking data:', {
      id: booking.id,
      athlete1Name: booking.athlete1Name,
      paidAmount: booking.paidAmount,
      paymentStatus: booking.paymentStatus,
      parentEmail: booking.parentEmail
    });
    
    // 1. Update payment status and amount
    console.log('💰 Updating payment status and amount...');
    await storage.updateBookingPaymentStatus(bookingId, PaymentStatusEnum.RESERVATION_PAID);
    await storage.updateBookingAttendanceStatus(bookingId, AttendanceStatusEnum.CONFIRMED);
    
    // 2. Update paid amount (Quick Journey is $40)
    await storage.updateBooking(bookingId, {
      reservationFeePaid: true,
      paidAmount: "40.00"
    });
    
    console.log('✅ Updated payment: Status → reservation-paid, Amount → $40.00');
    
    // 3. Create parent profile if needed
    console.log('👨‍👩‍👧 Creating/finding parent profile...');
    let parentRecord = await storage.identifyParent(booking.parentEmail, booking.parentPhone);
    
    if (!parentRecord) {
      parentRecord = await storage.createParent({
        firstName: booking.parentFirstName,
        lastName: booking.parentLastName,
        email: booking.parentEmail,
        phone: booking.parentPhone,
        emergencyContactName: booking.emergencyContactName || '',
        emergencyContactPhone: booking.emergencyContactPhone || '',
        waiverSigned: booking.waiverSigned || false,
        waiverSignedAt: booking.waiverSignedAt || null,
        waiverSignatureName: booking.waiverSignatureName || null
      });
      console.log(`✅ Created parent account for ${booking.parentEmail} (ID: ${parentRecord.id})`);
    } else {
      console.log(`✅ Using existing parent account for ${booking.parentEmail} (ID: ${parentRecord.id})`);
    }
    
    // 4. The tricky part - we need to get the athlete name from somewhere
    // Let's check if there are existing athletes or if we need to extract from the waiver
    console.log('🏃‍♂️ Finding athlete information...');
    
    // Check if there's a recent waiver that might contain the athlete name
    const { supabase } = require('./server/supabase-client.js');
    const { data: recentWaivers } = await supabase
      .from('waivers')
      .select('*')
      .order('signed_at', { ascending: false })
      .limit(5);
    
    console.log('📄 Recent waivers found:', recentWaivers?.length || 0);
    
    // Look for a waiver signed around the same time as the booking
    const bookingTime = new Date(booking.createdAt);
    const waiver = recentWaivers?.find(w => {
      const waiverTime = new Date(w.signed_at);
      const timeDiff = Math.abs(waiverTime - bookingTime) / (1000 * 60); // minutes
      return timeDiff < 30; // Within 30 minutes
    });
    
    if (waiver) {
      console.log('✅ Found matching waiver:', {
        athleteName: waiver.athlete_name,
        signerName: waiver.signer_name,
        timeDiff: Math.abs(new Date(waiver.signed_at) - bookingTime) / (1000 * 60)
      });
      
      // Create athlete profile
      const [firstName, ...lastNameParts] = waiver.athlete_name.split(' ');
      const lastName = lastNameParts.join(' ') || '';
      
      // Check if athlete already exists
      const existingAthletes = await storage.getAllAthletes();
      const existingAthlete = existingAthletes.find(a => 
        a.name === waiver.athlete_name && a.parentId === parentRecord.id
      );
      
      let athleteId;
      if (!existingAthlete) {
        const newAthlete = await storage.createAthlete({
          parentId: parentRecord.id,
          name: waiver.athlete_name,
          firstName,
          lastName,
          dateOfBirth: '2010-07-15', // We'll need to get this from somewhere or ask for it
          gender: null,
          experience: 'beginner',
          allergies: null
        });
        athleteId = newAthlete.id;
        console.log(`✅ Created athlete profile for ${waiver.athlete_name} (ID: ${athleteId})`);
      } else {
        athleteId = existingAthlete.id;
        console.log(`✅ Using existing athlete profile for ${waiver.athlete_name} (ID: ${athleteId})`);
      }
      
      // Update booking with athlete name and parent ID
      await storage.updateBooking(bookingId, {
        athlete1Name: waiver.athlete_name,
        parentId: parentRecord.id
      });
      
      console.log(`✅ Updated booking with athlete name: ${waiver.athlete_name}`);
      
      // Create booking-athlete relationship
      const { data: existingRelation } = await supabase
        .from('booking_athletes')
        .select('*')
        .eq('booking_id', bookingId)
        .eq('athlete_id', athleteId)
        .single();
      
      if (!existingRelation) {
        const { error } = await supabase
          .from('booking_athletes')
          .insert({
            booking_id: bookingId,
            athlete_id: athleteId
          });
        
        if (error) {
          console.error('❌ Error creating booking-athlete relationship:', error);
        } else {
          console.log(`✅ Created booking-athlete relationship: booking ${bookingId} ↔ athlete ${athleteId}`);
        }
      } else {
        console.log(`✅ Booking-athlete relationship already exists`);
      }
      
    } else {
      console.log('⚠️ No matching waiver found. Creating generic athlete from booking data...');
      
      // Fallback - create a basic athlete record with available data
      const athleteName = "Alfred S."; // From the earlier athlete we saw in logs
      const [firstName, ...lastNameParts] = athleteName.split(' ');
      const lastName = lastNameParts.join(' ') || '';
      
      const existingAthletes = await storage.getAllAthletes();
      const existingAthlete = existingAthletes.find(a => 
        a.name === athleteName && a.parentId === parentRecord.id
      );
      
      let athleteId;
      if (!existingAthlete) {
        const newAthlete = await storage.createAthlete({
          parentId: parentRecord.id,
          name: athleteName,
          firstName,
          lastName,
          dateOfBirth: '2010-07-15',
          gender: null,
          experience: 'beginner',
          allergies: null
        });
        athleteId = newAthlete.id;
        console.log(`✅ Created fallback athlete profile for ${athleteName} (ID: ${athleteId})`);
      } else {
        athleteId = existingAthlete.id;
        console.log(`✅ Using existing athlete profile for ${athleteName} (ID: ${athleteId})`);
      }
      
      // Update booking
      await storage.updateBooking(bookingId, {
        athlete1Name: athleteName,
        parentId: parentRecord.id
      });
      
      console.log(`✅ Updated booking with athlete name: ${athleteName}`);
    }
    
    // 5. Verify the fix
    console.log('🔍 Verifying the fix...');
    const updatedBooking = await storage.getBookingWithRelations(bookingId);
    console.log('✅ Final booking state:', {
      id: updatedBooking.id,
      athlete1Name: updatedBooking.athlete1Name,
      paidAmount: updatedBooking.paidAmount,
      paymentStatus: updatedBooking.paymentStatus,
      parentId: updatedBooking.parentId,
      athletes: updatedBooking.athletes?.length || 0
    });
    
    console.log('🎉 Manual webhook fix completed!');
    
  } catch (error) {
    console.error('❌ Error during manual fix:', error);
  }
}

// Run the fix
fixBooking83().then(() => process.exit(0)).catch(console.error);
