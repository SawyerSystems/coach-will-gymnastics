const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkParentForBooking() {
  try {
    console.log('🔍 Checking parent for booking #221...\n');
    
    // Get parent with ID 172
    const { data: parent, error } = await supabase
      .from('parents')
      .select('*')
      .eq('id', 172)
      .single();
    
    if (error) {
      console.error('❌ Error fetching parent:', error);
      return;
    }
    
    console.log('👤 Parent Details for booking #221:');
    console.log(`   ID: ${parent.id}`);
    console.log(`   Name: ${parent.first_name} ${parent.last_name}`);
    console.log(`   Email: ${parent.email} ✅`);
    console.log(`   Phone: ${parent.phone}`);
    console.log(`   Created: ${parent.created_at}`);
    
    // Now test the webhook email logic to see what should happen
    console.log('\n📧 Testing email logic...');
    
    // This simulates what the webhook should do:
    const parentEmail = parent.email; // Should be available 
    const parentName = `${parent.first_name} ${parent.last_name}`.trim();
    
    console.log(`   Parent Email for confirmation: ${parentEmail}`);
    console.log(`   Parent Name: ${parentName}`);
    console.log(`   Admin Email: ${process.env.ADMIN_EMAIL}`);
    
    if (parentEmail) {
      console.log('✅ Parent email is available - confirmation email SHOULD be sent');
    } else {
      console.log('❌ No parent email - this is why confirmation emails fail');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkParentForBooking();
