const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkBookings() {
  try {
    console.log('🔍 Checking recent bookings...\n');
    
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(15);
    
    if (error) {
      console.error('❌ Error fetching bookings:', error);
      return;
    }
    
    console.log(`📋 Found ${bookings.length} recent bookings:\n`);
    
    bookings.forEach(booking => {
      console.log(`📅 Booking #${booking.id} (${booking.created_at})`);
      console.log(`   Parent: ${booking.parent_first_name || 'Unknown'} ${booking.parent_last_name || ''}`);
      console.log(`   Email: ${booking.parent_email || 'No email'}`);
      console.log(`   Payment Status: ${booking.payment_status}`);
      console.log(`   Attendance: ${booking.attendance_status}`);
      console.log(`   Session Confirmation Email: ${booking.session_confirmation_email_sent ? 'SENT ✅' : 'NOT SENT ❌'}`);
      if (booking.session_confirmation_email_sent_at) {
        console.log(`   Email Sent At: ${booking.session_confirmation_email_sent_at}`);
      }
      console.log(`   Stripe Session: ${booking.stripe_session_id || 'None'}`);
      console.log(`   Amount: $${booking.amount || '0'}`);
      console.log('   ---');
    });
    
    // Find paid bookings without confirmation emails
    const paidWithoutEmails = bookings.filter(b => 
      (b.payment_status === 'reservation-paid' || b.payment_status === 'session-paid') && 
      !b.session_confirmation_email_sent
    );
    
    console.log(`\n🔍 Analysis:`);
    console.log(`   Paid bookings without confirmation emails: ${paidWithoutEmails.length}`);
    
    if (paidWithoutEmails.length > 0) {
      console.log('\n❌ These paid bookings are missing confirmation emails:');
      paidWithoutEmails.forEach(b => {
        console.log(`   - Booking #${b.id}: ${b.parent_email} (${b.payment_status})`);
      });
    } else {
      console.log('✅ All paid bookings have confirmation emails sent');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkBookings();
