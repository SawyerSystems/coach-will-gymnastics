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
        emergencyContactName: booking.emergencyContactName,
        emergencyContactPhone: booking.emergencyContactPhone
      });
      console.log('✅ Created parent profile:', parentRecord.id);
    } else {
      console.log('✅ Found existing parent:', parentRecord.id);
    }
    
    // 4. Create athlete profile if needed
    console.log('🏃‍♂️ Creating/finding athlete profile...');
    
    if (booking.athlete1Name) {
      let athleteRecord = await storage.getAllAthletes();
      athleteRecord = athleteRecord.find(a => 
        a.name === booking.athlete1Name && 
        a.dateOfBirth === booking.athlete1DateOfBirth
      );
      
      if (!athleteRecord) {
        const newAthlete = await storage.createAthlete({
          parentId: parentRecord.id,
          name: booking.athlete1Name,
          firstName: booking.athlete1Name.split(' ')[0],
          lastName: booking.athlete1Name.split(' ').slice(1).join(' '),
          dateOfBirth: booking.athlete1DateOfBirth,
          experience: booking.athlete1Experience || 'beginner',
          allergies: booking.athlete1Allergies
        });
        console.log('✅ Created athlete profile:', newAthlete.id);
      } else {
        console.log('✅ Found existing athlete:', athleteRecord.id);
      }
    }
    
    console.log('🎉 Booking 83 manual fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing booking 83:', error);
  }
}

// Run the fix
fixBooking83().catch(console.error);
