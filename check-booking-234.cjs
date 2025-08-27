const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkBooking234() {
  try {
    console.log('🔍 Checking booking #234 details...\n');
    
    // Get booking details
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', 234)
      .single();
    
    if (error) {
      console.error('❌ Error fetching booking:', error);
      return;
    }
    
    console.log('📋 Booking #234 Details:');
    console.log(`   Parent ID: ${booking.parent_id}`);
    console.log(`   Payment Status: ${booking.payment_status}`);
    console.log(`   Email Sent: ${booking.session_confirmation_email_sent}`);
    console.log(`   Stripe Session: ${booking.stripe_session_id || 'None'}`);
    
    // Get parent details if parent_id exists
    if (booking.parent_id) {
      const { data: parent, error: parentError } = await supabase
        .from('parents')
        .select('*')
        .eq('id', booking.parent_id)
        .single();
      
      if (parentError) {
        console.error('❌ Error fetching parent:', parentError);
      } else {
        console.log('\n👤 Parent Details:');
        console.log(`   Name: ${parent.first_name} ${parent.last_name}`);
        console.log(`   Email: ${parent.email}`);
        console.log(`   Phone: ${parent.phone}`);
      }
    } else {
      console.log('\n❌ No parent ID linked to this booking');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkBooking234();
