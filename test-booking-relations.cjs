const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testGetBookingWithRelations() {
  try {
    console.log('🔍 Testing getBookingWithRelations for booking #221...\n');
    
    // Simulate what the storage.getBookingWithRelations should do
    // First get the booking
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', 234)
      .single();
    
    if (error) {
      console.error('❌ Error fetching booking:', error);
      return;
    }
    
    console.log('📋 Base booking data:');
    console.log(`   ID: ${booking.id}`);
    console.log(`   Parent ID: ${booking.parent_id}`);
    console.log(`   Payment Status: ${booking.payment_status}`);
    console.log(`   Session Confirmation Email Sent: ${booking.session_confirmation_email_sent}`);
    
    // Now get the parent
    let parent = null;
    if (booking.parent_id) {
      const { data: parentData, error: parentError } = await supabase
        .from('parents')
        .select('*')
        .eq('id', booking.parent_id)
        .single();
      
      if (parentError) {
        console.error('❌ Error fetching parent:', parentError);
      } else {
        parent = parentData;
        console.log('\n👤 Parent data found:');
        console.log(`   Parent ID: ${parent.id}`);
        console.log(`   Parent Email: ${parent.email}`);
        console.log(`   Parent Name: ${parent.first_name} ${parent.last_name}`);
      }
    }
    
    // Test the email logic that should work in the webhook
    const parentEmail = parent?.email || booking.parent_email;
    console.log('\n📧 Email logic test:');
    console.log(`   Parent email from relation: ${parent?.email}`);
    console.log(`   Parent email from booking: ${booking.parent_email}`);
    console.log(`   Final email to use: ${parentEmail}`);
    
    if (parentEmail) {
      console.log('✅ Email available - webhook SHOULD send confirmation email');
    } else {
      console.log('❌ No email available - webhook CANNOT send confirmation email');
    }
    
    // Check if the payment status qualifies for email
    const isPaid = booking.payment_status === 'reservation-paid' || booking.payment_status === 'session-paid';
    console.log(`   Payment qualifies for email: ${isPaid ? 'YES' : 'NO'}`);
    console.log(`   Email already sent: ${booking.session_confirmation_email_sent ? 'YES' : 'NO'}`);
    
    if (isPaid && !booking.session_confirmation_email_sent && parentEmail) {
      console.log('\n🚨 This booking SHOULD receive a confirmation email but hasn\'t!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testGetBookingWithRelations();
