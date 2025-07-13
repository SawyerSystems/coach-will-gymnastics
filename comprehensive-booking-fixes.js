import storage from './server/storage.ts';

async function comprehensiveDiagnostic() {
  console.log('🔍 COMPREHENSIVE BOOKING SYSTEM DIAGNOSTIC\n');
  
  try {
    // 1. Check booking data
    console.log('1. BOOKING DATA ANALYSIS:');
    const allBookings = await storage.getAllBookings();
    console.log(`   Total bookings: ${allBookings.length}`);
    
    if (allBookings.length > 0) {
      const sampleBooking = allBookings[0];
      console.log('   Sample booking structure:');
      console.log('   - ID:', sampleBooking.id);
      console.log('   - Payment Status:', sampleBooking.paymentStatus);
      console.log('   - Attendance Status:', sampleBooking.attendanceStatus);
      console.log('   - Amount:', sampleBooking.amount);
      console.log('   - Paid Amount:', sampleBooking.paidAmount);
      console.log('   - Athletes Array:', !!sampleBooking.athletes);
      console.log('   - Legacy athlete1Name:', sampleBooking.athlete1Name);
      console.log('   - Stripe Session ID:', sampleBooking.stripeSessionId);
    }
    
    // 2. Check bookings with relations
    console.log('\n2. BOOKINGS WITH RELATIONS:');
    const bookingsWithRelations = await storage.getAllBookingsWithRelations();
    console.log(`   Bookings with relations: ${bookingsWithRelations.length}`);
    
    if (bookingsWithRelations.length > 0) {
      const sampleWithRelations = bookingsWithRelations[0];
      console.log('   Sample with relations:');
      console.log('   - Athletes count:', sampleWithRelations.athletes?.length || 0);
      if (sampleWithRelations.athletes?.[0]) {
        console.log('   - First athlete:', sampleWithRelations.athletes[0].name);
      }
    }
    
    // 3. Find recent bookings with Alfred
    console.log('\n3. ALFRED BOOKING SEARCH:');
    const alfredBookings = allBookings.filter(b => 
      b.parentFirstName?.toLowerCase().includes('alfred') ||
      b.athlete1Name?.toLowerCase().includes('alfred') ||
      (b.athletes && b.athletes.some(a => a.name?.toLowerCase().includes('alfred')))
    );
    
    console.log(`   Found ${alfredBookings.length} Alfred bookings`);
    if (alfredBookings.length > 0) {
      const alfredBooking = alfredBookings[0];
      console.log('   Alfred booking details:');
      console.log('   - ID:', alfredBooking.id);
      console.log('   - Payment Status:', alfredBooking.paymentStatus);
      console.log('   - Attendance Status:', alfredBooking.attendanceStatus);
      console.log('   - Amount:', alfredBooking.amount);
      console.log('   - Paid Amount:', alfredBooking.paidAmount);
      console.log('   - Stripe Session:', alfredBooking.stripeSessionId);
      console.log('   - Parent Email:', alfredBooking.parentEmail);
      console.log('   - Athletes Array Length:', alfredBooking.athletes?.length || 0);
      console.log('   - Legacy Athlete1:', alfredBooking.athlete1Name);
    }
    
    // 4. Check athletes table
    console.log('\n4. ATHLETES TABLE:');
    const allAthletes = await storage.getAllAthletes();
    console.log(`   Total athletes: ${allAthletes.length}`);
    
    const alfredAthletes = allAthletes.filter(a => 
      a.name?.toLowerCase().includes('alfred') ||
      a.firstName?.toLowerCase().includes('alfred')
    );
    console.log(`   Alfred athletes: ${alfredAthletes.length}`);
    
    if (alfredAthletes.length > 0) {
      console.log('   Alfred athlete details:', alfredAthletes[0]);
    }
    
    // 5. Check parents table
    console.log('\n5. PARENTS TABLE:');
    const allParents = await storage.getAllParents();
    console.log(`   Total parents: ${allParents.length}`);
    
    const alfredParents = allParents.filter(p => 
      p.firstName?.toLowerCase().includes('alfred') ||
      p.email?.toLowerCase().includes('alfred')
    );
    console.log(`   Alfred parents: ${alfredParents.length}`);
    
    if (alfredParents.length > 0) {
      console.log('   Alfred parent details:', alfredParents[0]);
    }
    
    console.log('\n✅ DIAGNOSTIC COMPLETE');
    
  } catch (error) {
    console.error('❌ DIAGNOSTIC ERROR:', error.message);
    console.error(error.stack);
  }
}

comprehensiveDiagnostic().then(() => process.exit(0));
