/**
 * SQL FIX for Alfred's Booking
 * Direct database update to link booking with athlete
 */

import { createClient } from '@supabase/supabase-js';

async function fixAlfredBookingSQL() {
  console.log('🔧 SQL FIX - Linking Alfred\'s Booking\n');
  
  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('❌ Missing Supabase credentials');
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('📋 Current booking status check...');
    
    // Get current booking
    const { data: currentBooking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', 82)
      .single();
    
    if (fetchError) {
      console.error('❌ Error fetching booking:', fetchError.message);
      return;
    }
    
    console.log('📊 Current booking data:');
    console.log(`   athlete1Name: "${currentBooking.athlete1Name}"`);
    console.log(`   parentId: ${currentBooking.parentId}`);
    console.log(`   parentEmail: ${currentBooking.parentEmail}`);
    
    // Update the booking
    console.log('\n🔧 Updating booking with Alfred\'s information...');
    
    const { data: updateResult, error: updateError } = await supabase
      .from('bookings')
      .update({
        athlete1Name: 'Alfred S.',
        athlete1DateOfBirth: '2010-07-15',
        athlete1Experience: 'beginner',
        athlete1Allergies: 'None',
        parentId: 48
      })
      .eq('id', 82)
      .select();
    
    if (updateError) {
      console.error('❌ Update failed:', updateError.message);
      return;
    }
    
    console.log('✅ Booking updated successfully!');
    
    // Verify the update
    const { data: verifyBooking, error: verifyError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', 82)
      .single();
    
    if (verifyError) {
      console.error('❌ Verification failed:', verifyError.message);
      return;
    }
    
    console.log('\n📋 Updated booking verification:');
    console.log(`   ✅ athlete1Name: "${verifyBooking.athlete1Name}"`);
    console.log(`   ✅ athlete1DateOfBirth: "${verifyBooking.athlete1DateOfBirth}"`);
    console.log(`   ✅ parentId: ${verifyBooking.parentId}`);
    
    console.log('\n🎉 FIX COMPLETE!');
    console.log('   ✅ Alfred\'s booking is now properly linked');
    console.log('   ✅ Refresh admin portal to see "Alfred S." in bookings table');
    console.log('   ✅ Alfred\'s athlete profile should now show booking history');
    
  } catch (error) {
    console.error('❌ SQL Fix failed:', error.message);
  }
}

// Run the SQL fix
fixAlfredBookingSQL();
