const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function debugWaiver18() {
  console.log('=== DEBUGGING WAIVER ID 18 ===');
  
  try {
    // First, check if waiver 18 exists at all
    console.log('\n1. Checking if waiver 18 exists...');
    const { data: waivers, error: waiversError } = await supabaseAdmin
      .from('waivers')
      .select('*')
      .eq('id', 18);
    
    if (waiversError) {
      console.error('Error querying waivers:', waiversError);
      return;
    }
    
    console.log('Waivers found:', waivers?.length);
    if (waivers && waivers.length > 0) {
      console.log('Waiver 18 data:', JSON.stringify(waivers[0], null, 2));
      
      const waiver = waivers[0];
      
      // Check parent data if parent_id exists
      if (waiver.parent_id) {
        console.log('\n2. Checking parent ID:', waiver.parent_id);
        const { data: parent, error: parentError } = await supabaseAdmin
          .from('parents')
          .select('*')
          .eq('id', waiver.parent_id);
          
        if (parentError) {
          console.error('Error querying parent:', parentError);
        } else {
          console.log('Parent data:', parent);
        }
      }
      
      // Try the join query that's used in the endpoint
      console.log('\n3. Testing join query...');
      const { data: joinResult, error: joinError } = await supabaseAdmin
        .from('waivers')
        .select(`
          signed_at, 
          relationship_to_athlete,
          understands_risks,
          agrees_to_policies,
          authorizes_emergency_care,
          allows_photo_video,
          confirms_authority,
          parents!inner(first_name, last_name)
        `)
        .eq('id', 18)
        .single();
        
      if (joinError) {
        console.error('Join query error:', joinError);
      } else {
        console.log('Join query result:', JSON.stringify(joinResult, null, 2));
      }
      
    } else {
      console.log('No waiver found with ID 18');
    }
    
    // Check if there are any waivers at all
    console.log('\n4. Checking all waivers...');
    const { data: allWaivers, error: allWaiversError } = await supabaseAdmin
      .from('waivers')
      .select('id, athlete_id, parent_id, signed_at')
      .order('id', { ascending: false })
      .limit(10);
      
    if (allWaiversError) {
      console.error('Error querying all waivers:', allWaiversError);
    } else {
      console.log('Recent waivers:', allWaivers);
    }
    
  } catch (error) {
    console.error('Script error:', error);
  }
}

debugWaiver18();
