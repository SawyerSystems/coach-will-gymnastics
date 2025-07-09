import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearTestData() {
  console.log('🗑️ Clearing test data...');
  
  try {
    // Delete all athletes
    const { error: athleteError } = await supabase
      .from('athletes')
      .delete()
      .neq('id', 0);
    
    if (athleteError) {
      console.error('Error deleting athletes:', athleteError);
    } else {
      console.log('✅ Athletes deleted');
    }
    
    // Delete all parents
    const { error: parentError } = await supabase
      .from('parents')
      .delete()
      .neq('id', 0);
    
    if (parentError) {
      console.error('Error deleting parents:', parentError);
    } else {
      console.log('✅ Parents deleted');
    }
    
    // Delete all bookings
    const { error: bookingError } = await supabase
      .from('bookings')
      .delete()
      .neq('id', 0);
    
    if (bookingError) {
      console.error('Error deleting bookings:', bookingError);
    } else {
      console.log('✅ Bookings deleted');
    }
    
    // Delete all waivers
    const { error: waiverError } = await supabase
      .from('waivers')
      .delete()
      .neq('id', 0);
    
    if (waiverError) {
      console.error('Error deleting waivers:', waiverError);
    } else {
      console.log('✅ Waivers deleted');
    }
    
    console.log('✅ All test data cleared successfully!');
    
  } catch (error) {
    console.error('Error clearing data:', error);
  }
}

clearTestData();