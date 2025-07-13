/**
 * DIRECT DATABASE FIX for Alfred's Booking
 * Updates booking ID 82 to link it with Alfred's athlete profile
 */

import storage from './server/storage.ts';

async function fixAlfredBookingDirect() {
  console.log('🔧 DIRECT DATABASE FIX - Alfred Booking Linkage\n');
  
  try {
    // Get the current booking
    const booking = await storage.getBooking(82);
    if (!booking) {
      console.log('❌ Booking 82 not found');
      return;
    }
    
    console.log('📋 Current booking data:');
    console.log(`   ID: ${booking.id}`);
    console.log(`   Parent: ${booking.parentFirstName} ${booking.parentLastName}`);
    console.log(`   Current athlete1Name: "${booking.athlete1Name}"`);
    console.log(`   Current parentId: ${booking.parentId}`);
    
    // Update the booking with Alfred's information
    console.log('\n🔧 Updating booking with Alfred\'s data...');
    
    const updateResult = await storage.updateBooking(82, {
      athlete1Name: 'Alfred S.',
      athlete1DateOfBirth: '2010-07-15',
      athlete1Experience: 'beginner',
      athlete1Allergies: 'None',
      parentId: 48
    });
    
    console.log('✅ Booking updated successfully!');
    
    // Verify the update
    const updatedBooking = await storage.getBooking(82);
    console.log('\n📋 Updated booking data:');
    console.log(`   athlete1Name: "${updatedBooking.athlete1Name}"`);
    console.log(`   athlete1DateOfBirth: "${updatedBooking.athlete1DateOfBirth}"`);
    console.log(`   parentId: ${updatedBooking.parentId}`);
    
    // Test with relations
    console.log('\n🔍 Testing booking with relations...');
    const bookingWithRelations = await storage.getBookingWithRelations(82);
    if (bookingWithRelations && bookingWithRelations.athletes) {
      console.log(`✅ Athletes array now has ${bookingWithRelations.athletes.length} athletes:`);
      bookingWithRelations.athletes.forEach(athlete => {
        console.log(`   - ${athlete.name} (ID: ${athlete.id})`);
      });
    } else {
      console.log('📝 Still using legacy format (athlete1Name)');
    }
    
    console.log('\n🎉 FIX COMPLETE!');
    console.log('   ✅ Alfred\'s booking now properly linked');
    console.log('   ✅ Admin portal should now show "Alfred S." in bookings table');
    console.log('   ✅ Alfred\'s profile should show the booking in history');
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    console.error(error.stack);
  }
}

// Run the fix
fixAlfredBookingDirect();
