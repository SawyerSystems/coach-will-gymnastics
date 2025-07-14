#!/usr/bin/env node

import { SupabaseStorage } from './server/storage.ts';

async function testAlfredBookingFixes() {
  console.log('🧪 Testing Alfred booking fixes...');
  
  const storage = new SupabaseStorage();
  
  try {
    // 1. Get all bookings to check relationships
    console.log('\n📋 Checking all bookings for Alfred...');
    const allBookings = await storage.getAllBookings();
    const alfredBookings = allBookings.filter(b => 
      b.athlete1Name?.includes('Alfred') || 
      b.athlete2Name?.includes('Alfred') ||
      b.parentFirstName?.includes('Alfred') ||
      (b.athletes && Array.isArray(b.athletes) && 
       b.athletes.some(a => a.name?.includes('Alfred')))
    );
    
    console.log(`Found ${alfredBookings.length} bookings related to Alfred:`);
    alfredBookings.forEach(booking => {
      console.log(`  - Booking ID ${booking.id}:`);
      console.log(`    Date: ${booking.preferredDate}`);
      console.log(`    Status: ${booking.status}`);
      console.log(`    Payment: ${booking.paymentStatus}`);
      console.log(`    Athlete1: ${booking.athlete1Name}`);
      console.log(`    Athlete2: ${booking.athlete2Name}`);
      console.log(`    Parent Email: ${booking.parentEmail}`);
      if (booking.athletes) {
        console.log(`    Athletes Array: ${booking.athletes.map(a => a.name).join(', ')}`);
      }
      console.log('');
    });
    
    // 2. Get athletes named Alfred
    console.log('\n👦 Checking athletes named Alfred...');
    const allAthletes = await storage.getAllAthletes();
    const alfredAthletes = allAthletes.filter(a => 
      a.name?.includes('Alfred') || 
      a.firstName?.includes('Alfred')
    );
    
    console.log(`Found ${alfredAthletes.length} athletes named Alfred:`);
    alfredAthletes.forEach(athlete => {
      console.log(`  - Athlete ID ${athlete.id}:`);
      console.log(`    Name: ${athlete.name}`);
      console.log(`    First Name: ${athlete.firstName}`);
      console.log(`    Last Name: ${athlete.lastName}`);
      console.log(`    Date of Birth: ${athlete.dateOfBirth}`);
      console.log(`    Gender: ${athlete.gender}`);
      console.log(`    Parent ID: ${athlete.parentId}`);
      console.log('');
    });
    
    // 3. Check booking relationships in the junction table
    console.log('\n🔗 Checking booking_athletes relationships...');
    // This would require direct SQL query to Supabase
    
    // 4. Test upcoming booking filters
    console.log('\n📅 Testing upcoming booking logic...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcomingBookings = alfredBookings.filter(b => {
      const bookingDate = new Date(b.preferredDate);
      return bookingDate >= today && 
             b.status !== 'cancelled' &&
             b.status !== 'completed';
    });
    
    console.log(`Alfred has ${upcomingBookings.length} upcoming bookings:`);
    upcomingBookings.forEach(booking => {
      console.log(`  - ${booking.preferredDate} at ${booking.preferredTime} (${booking.lessonType})`);
      console.log(`    Status: ${booking.status}, Payment: ${booking.paymentStatus}`);
    });
    
    // 5. Check waiver status
    console.log('\n📝 Checking waiver status...');
    const hasWaiver = alfredBookings.some(b => b.waiverSigned);
    console.log(`Alfred has waiver signed: ${hasWaiver}`);
    
    if (hasWaiver) {
      const waiverBooking = alfredBookings.find(b => b.waiverSigned);
      console.log(`  Waiver signed on booking ${waiverBooking.id}`);
      console.log(`  Signed by: ${waiverBooking.waiverSignatureName}`);
      console.log(`  Signed at: ${waiverBooking.waiverSignedAt}`);
    }
    
    console.log('\n✅ Alfred booking test completed!');
    
  } catch (error) {
    console.error('❌ Error testing Alfred booking fixes:', error);
  }
}

// Run the test
testAlfredBookingFixes().catch(console.error);
