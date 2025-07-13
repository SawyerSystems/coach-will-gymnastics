/**
 * FIX ALFRED'S BOOKING LINKAGE
 * Link the existing booking to Alfred's athlete profile
 */

async function fixAlfredBooking() {
  console.log('🔧 FIXING ALFRED BOOKING LINKAGE\n');
  
  try {
    // Get the booking data
    const bookingResponse = await fetch('http://localhost:5001/api/bookings-with-relations');
    const bookings = await bookingResponse.json();
    
    if (bookings.length === 0) {
      console.log('❌ No bookings found');
      return;
    }
    
    const booking = bookings[0]; // The booking ID 82
    console.log(`📋 Found booking ID: ${booking.id}`);
    console.log(`   Parent: ${booking.parentFirstName} ${booking.parentLastName}`);
    console.log(`   Email: ${booking.parentEmail}`);
    console.log(`   Current athlete1Name: "${booking.athlete1Name}"`);
    console.log(`   Current parentId: ${booking.parentId}`);
    
    // Check if Alfred's athlete profile exists
    const athleteResponse = await fetch('http://localhost:5001/api/athletes');
    if (!athleteResponse.ok) {
      console.log('❌ Cannot access athletes endpoint (requires auth)');
      console.log('   📝 Need to manually update the booking with Alfred S. as athlete1Name');
      console.log('   📝 And set parentId to 48 (from server logs)');
      
      // Based on server logs, we know:
      // - Alfred's athlete ID: 65
      // - Alfred's parent ID: 48
      // - Alfred's name: "Alfred S."
      
      console.log('\n🔧 MANUAL FIX NEEDED:');
      console.log('   Update booking ID 82 with:');
      console.log('   - athlete1Name: "Alfred S."');
      console.log('   - parentId: 48');
      console.log('   - athlete1DateOfBirth: "2010-07-15"');
      console.log('   - athlete1Experience: "beginner"');
      console.log('   - athlete1Allergies: "None"');
      
      return;
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the fix
fixAlfredBooking();
