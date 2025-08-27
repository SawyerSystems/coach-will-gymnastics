const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSpecificBooking() {
  try {
    console.log('🔍 Checking booking #221 (has Stripe session ID)...\n');
    
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', 221)
      .single();
    
    if (error) {
      console.error('❌ Error fetching booking:', error);
      return;
    }
    
    console.log('📋 Booking Details:');
    console.log(JSON.stringify(booking, null, 2));
    
    // Check if there are any parent records
    const { data: parents, error: parentError } = await supabase
      .from('parents')
      .select('*')
      .limit(5);
    
    if (parentError) {
      console.error('❌ Error fetching parents:', parentError);
    } else {
      console.log(`\n👥 Found ${parents.length} parent records in database`);
      if (parents.length > 0) {
        console.log('Sample parent emails:', parents.map(p => p.email).slice(0, 3));
      }
    }
    
    // Check if there are any admin notifications sent
    console.log('\n📬 Checking if admin emails are configured...');
    console.log(`ADMIN_EMAIL: ${process.env.ADMIN_EMAIL}`);
    console.log(`FROM_EMAIL: ${process.env.FROM_EMAIL}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkSpecificBooking();
