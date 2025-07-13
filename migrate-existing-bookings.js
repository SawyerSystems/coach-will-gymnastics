/**
 * MIGRATE EXISTING BOOKINGS TO NEW RELATIONSHIP SYSTEM
 * 
 * This script fixes bookings created before the relationship system
 * by creating parent-athlete profiles and linking them properly.
 */

async function makeRequest(method, url, data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(`http://localhost:5001${url}`, options);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${method} ${url} failed: ${response.status} ${response.statusText} - ${text}`);
  }
  return response.json();
}

async function migrateExistingBookings() {
  console.log('🔄 MIGRATING EXISTING BOOKINGS TO RELATIONSHIP SYSTEM\n');
  
  try {
    // Get all bookings
    const bookings = await makeRequest('GET', '/api/bookings-with-relations');
    console.log(`📊 Total bookings: ${bookings.length}`);
    
    // Get current parents and athletes
    const parents = await makeRequest('GET', '/api/parents');
    const athletes = await makeRequest('GET', '/api/athletes');
    
    console.log(`📊 Current parents: ${parents.length}, athletes: ${athletes.length}`);
    
    // Find bookings without parent relationships
    const unlinkedBookings = bookings.filter(b => !b.parentId && b.parentEmail);
    console.log(`\n🔍 Found ${unlinkedBookings.length} bookings without parent relationships`);
    
    if (unlinkedBookings.length === 0) {
      console.log('✅ All bookings already have proper relationships!');
      return;
    }
    
    let migratedCount = 0;
    
    for (const booking of unlinkedBookings) {
      console.log(`\n📝 Processing booking ${booking.id}:`);
      console.log(`   Parent: ${booking.parentFirstName} ${booking.parentLastName} (${booking.parentEmail})`);
      console.log(`   Athlete: ${booking.athlete1Name || 'N/A'}`);
      console.log(`   Payment Status: ${booking.paymentStatus}`);
      
      try {
        // Create or find parent
        let parentRecord = parents.find(p => p.email === booking.parentEmail);
        
        if (!parentRecord) {
          console.log('   🔧 Creating parent profile...');
          parentRecord = await makeRequest('POST', '/api/parents', {
            firstName: booking.parentFirstName,
            lastName: booking.parentLastName,
            email: booking.parentEmail,
            phone: booking.parentPhone || '',
            emergencyContactName: booking.emergencyContactName || '',
            emergencyContactPhone: booking.emergencyContactPhone || '',
            waiverSigned: booking.waiverSigned || false,
            waiverSignedAt: booking.waiverSignedAt || null,
            waiverSignatureName: booking.waiverSignatureName || null
          });
          console.log(`   ✅ Created parent ID: ${parentRecord.id}`);
        } else {
          console.log(`   ✅ Found existing parent ID: ${parentRecord.id}`);
        }
        
        // Create athlete if needed
        if (booking.athlete1Name && booking.athlete1DateOfBirth) {
          const existingAthlete = athletes.find(a => 
            a.name === booking.athlete1Name && 
            a.dateOfBirth === booking.athlete1DateOfBirth &&
            a.parentId === parentRecord.id
          );
          
          if (!existingAthlete) {
            console.log('   🔧 Creating athlete profile...');
            const [firstName, ...lastNameParts] = booking.athlete1Name.split(' ');
            const lastName = lastNameParts.join(' ') || '';
            
            const newAthlete = await makeRequest('POST', '/api/athletes', {
              parentId: parentRecord.id,
              name: booking.athlete1Name,
              firstName,
              lastName,
              dateOfBirth: booking.athlete1DateOfBirth,
              gender: booking.athlete1Gender || null,
              experience: booking.athlete1Experience || 'beginner',
              allergies: booking.athlete1Allergies || null
            });
            console.log(`   ✅ Created athlete ID: ${newAthlete.id}`);
          } else {
            console.log(`   ✅ Found existing athlete ID: ${existingAthlete.id}`);
          }
        }
        
        // Update booking with parent relationship
        console.log('   🔧 Linking booking to parent...');
        await makeRequest('PATCH', `/api/bookings/${booking.id}`, {
          parentId: parentRecord.id
        });
        console.log(`   ✅ Booking ${booking.id} linked to parent ${parentRecord.id}`);
        
        migratedCount++;
        
      } catch (migrationError) {
        console.error(`   ❌ Migration failed for booking ${booking.id}:`, migrationError.message);
      }
    }
    
    console.log(`\n🎉 MIGRATION COMPLETE: ${migratedCount}/${unlinkedBookings.length} bookings migrated successfully`);
    
    // Verify results
    console.log('\n🔍 VERIFICATION:');
    const updatedBookings = await makeRequest('GET', '/api/bookings-with-relations');
    const nowLinked = updatedBookings.filter(b => b.parentId);
    console.log(`✅ Bookings with relationships: ${nowLinked.length}/${updatedBookings.length}`);
    
    // Check Alfred specifically
    const alfredBooking = updatedBookings.find(b => 
      b.parentFirstName?.toLowerCase().includes('alfred') ||
      b.athlete1Name?.toLowerCase().includes('alfred')
    );
    
    if (alfredBooking) {
      console.log('\n🎯 ALFRED BOOKING STATUS:');
      console.log(`   ✅ Has parent relationship: ${alfredBooking.parentId ? 'YES' : 'NO'}`);
      console.log(`   ✅ Payment status: ${alfredBooking.paymentStatus}`);
      console.log(`   ✅ Attendance status: ${alfredBooking.attendanceStatus}`);
    }
    
  } catch (error) {
    console.error('❌ MIGRATION ERROR:', error.message);
  }
}

// Run the migration
migrateExistingBookings();
