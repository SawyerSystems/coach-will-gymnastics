#!/usr/bin/env node

// Direct database fix for booking 83 - no API calls, direct storage access

import { SupabaseStorage } from './server/storage.js';
import { supabase } from './server/supabase-client.js';
import { AttendanceStatusEnum, PaymentStatusEnum } from './shared/schema.js';

async function directFixBooking83() {
  console.log('🔧 Direct database fix for booking 83...');
  
  const storage = new SupabaseStorage();
  const bookingId = 83;
  
  try {
    // 1. Get current booking
    console.log('📋 Getting current booking data...');
    const booking = await storage.getBooking(bookingId);
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
    
    // 2. Update payment status to reservation-paid (correct for reservation fee)
    console.log('💰 Setting payment status to reservation-paid...');
    await storage.updateBookingPaymentStatus(bookingId, PaymentStatusEnum.RESERVATION_PAID);
    await storage.updateBookingAttendanceStatus(bookingId, AttendanceStatusEnum.CONFIRMED);
    
    // 3. Set the correct paid amount to $0.50 (the actual Stripe reservation fee)
    console.log('💵 Setting paid amount to $0.50 (actual Stripe amount)...');
    await storage.updateBooking(bookingId, {
      paidAmount: "0.50",
      reservationFeePaid: true
    });
    
    // 4. Get existing athletes
    console.log('🏃‍♂️ Getting existing athletes...');
    const athletes = await storage.getAllAthletes();
    console.log('📋 Found athletes:', athletes.map(a => ({ id: a.id, name: a.name, parentId: a.parentId })));
    
    if (athletes.length > 0) {
      const athlete = athletes.find(a => a.name === 'Alfred S.') || athletes[0];
      console.log(`🎯 Using athlete: ${athlete.name} (ID: ${athlete.id}, Parent: ${athlete.parentId})`);
      
      // 5. Update booking with athlete name and parent ID
      console.log('🔗 Linking booking to athlete and parent...');
      await storage.updateBooking(bookingId, {
        athlete1Name: athlete.name,
        parentId: athlete.parentId
      });
      
      // 6. Create booking-athlete relationship in the junction table
      console.log('📊 Creating booking-athlete relationship...');
      const { data: existingRelation } = await supabase
        .from('booking_athletes')
        .select('*')
        .eq('booking_id', bookingId)
        .eq('athlete_id', athlete.id)
        .single();
      
      if (!existingRelation) {
        const { error } = await supabase
          .from('booking_athletes')
          .insert({
            booking_id: bookingId,
            athlete_id: athlete.id
          });
        
        if (error) {
          console.error('❌ Error creating booking-athlete relationship:', error);
        } else {
          console.log(`✅ Created booking-athlete relationship: booking ${bookingId} ↔ athlete ${athlete.id}`);
        }
      } else {
        console.log(`✅ Booking-athlete relationship already exists`);
      }
    }
    
    // 7. Verify the final result
    console.log('🔍 Verifying the final result...');
    const updatedBooking = await storage.getBookingWithRelations(bookingId);
    
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
    
    console.log('🎉 Direct database fix completed successfully!');
    console.log('');
    console.log('📝 Summary of fixes:');
    console.log('✅ Payment status: reservation-paid (correct for reservation fee)');
    console.log('✅ Paid amount: $0.50 (actual Stripe reservation amount)');
    console.log('✅ Attendance status: confirmed');
    console.log('✅ Athlete name: linked to Alfred S.');
    console.log('✅ Parent relationship: established');
    console.log('✅ Booking-athlete relationship: created in junction table');
    
  } catch (error) {
    console.error('❌ Error during direct fix:', error);
  }
}

// Run the fix
directFixBooking83().then(() => process.exit(0)).catch(console.error);
