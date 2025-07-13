/**
 * DIAGNOSTIC: Check actual booking data structure
 * This will show us exactly what data the admin portal is receiving
 */

console.log('🔍 BOOKING DATA DIAGNOSTIC');

fetch('http://localhost:5001/api/bookings-with-relations')
  .then(response => response.json())
  .then(bookings => {
    console.log('\n📊 BOOKING DATA ANALYSIS:');
    console.log(`Total bookings: ${bookings.length}`);
    
    if (bookings.length > 0) {
      const booking = bookings[0];
      console.log('\n📋 Raw booking object:');
      console.log(JSON.stringify(booking, null, 2));
      
      console.log('\n🔍 Key fields analysis:');
      console.log(`- booking.id: ${booking.id}`);
      console.log(`- booking.parentId: ${booking.parentId}`);
      console.log(`- booking.athlete1Name: ${booking.athlete1Name}`);
      console.log(`- booking.athlete2Name: ${booking.athlete2Name}`);
      console.log(`- booking.athletes: ${booking.athletes ? 'EXISTS' : 'NULL'}`);
      if (booking.athletes) {
        console.log(`  - athletes length: ${booking.athletes.length}`);
        booking.athletes.forEach((athlete, i) => {
          console.log(`  - athlete ${i + 1}: ${athlete.name} (ID: ${athlete.id})`);
        });
      }
      
      console.log('\n💡 DIAGNOSIS:');
      if (!booking.athletes && !booking.athlete1Name) {
        console.log('❌ PROBLEM: No athlete data in either format');
        console.log('   This explains why admin table shows "No athletes"');
      } else if (booking.athletes && booking.athletes.length > 0) {
        console.log('✅ Athletes array is populated');
      } else if (booking.athlete1Name) {
        console.log('✅ Legacy athlete name is present');
      }
    }
  })
  .catch(error => {
    console.error('❌ Error:', error.message);
  });
