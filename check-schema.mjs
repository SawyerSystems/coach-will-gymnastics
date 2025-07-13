import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkSchema() {
  console.log('🔍 Checking database schema...\n');
  
  try {
    // Check bookings table structure
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .limit(1);
    
    if (bookingsError) {
      console.error('❌ Bookings table error:', bookingsError);
    } else {
      console.log('✅ Bookings table exists');
      if (bookings && bookings.length > 0) {
        console.log('📋 Bookings columns:', Object.keys(bookings[0]));
      }
    }

    // Check if booking_athletes table exists
    const { data: bookingAthletes, error: baError } = await supabase
      .from('booking_athletes')
      .select('*')
      .limit(1);
    
    if (baError) {
      console.log('❌ booking_athletes table does not exist:', baError.message);
    } else {
      console.log('✅ booking_athletes table exists');
      if (bookingAthletes && bookingAthletes.length > 0) {
        console.log('📋 booking_athletes columns:', Object.keys(bookingAthletes[0]));
      }
    }

    // Check athletes table
    const { data: athletes, error: athletesError } = await supabase
      .from('athletes')
      .select('*')
      .limit(1);
    
    if (athletesError) {
      console.error('❌ Athletes table error:', athletesError);
    } else {
      console.log('✅ Athletes table exists');
      if (athletes && athletes.length > 0) {
        console.log('📋 Athletes columns:', Object.keys(athletes[0]));
      }
    }

    // Check parents table
    const { data: parents, error: parentsError } = await supabase
      .from('parents')
      .select('*')
      .limit(1);
    
    if (parentsError) {
      console.error('❌ Parents table error:', parentsError);
    } else {
      console.log('✅ Parents table exists');
      if (parents && parents.length > 0) {
        console.log('📋 Parents columns:', Object.keys(parents[0]));
      }
    }

    // Check focus_areas table (should NOT have description column)
    const { data: focusAreas, error: focusAreasError } = await supabase
      .from('focus_areas')
      .select('*')
      .limit(1);
    
    if (focusAreasError) {
      console.error('❌ Focus areas table error:', focusAreasError);
    } else {
      console.log('✅ Focus areas table exists');
      if (focusAreas && focusAreas.length > 0) {
        console.log('📋 Focus areas columns:', Object.keys(focusAreas[0]));
        // Verify no description column
        if (!Object.keys(focusAreas[0]).includes('description')) {
          console.log('✅ Description column correctly removed from focus_areas');
        } else {
          console.log('⚠️ Description column still exists in focus_areas');
        }
      }
    }

    // Check apparatus table (should NOT have description column)
    const { data: apparatus, error: apparatusError } = await supabase
      .from('apparatus')
      .select('*')
      .limit(1);
    
    if (apparatusError) {
      console.error('❌ Apparatus table error:', apparatusError);
    } else {
      console.log('✅ Apparatus table exists');
      if (apparatus && apparatus.length > 0) {
        console.log('📋 Apparatus columns:', Object.keys(apparatus[0]));
        // Verify no description column
        if (!Object.keys(apparatus[0]).includes('description')) {
          console.log('✅ Description column correctly removed from apparatus');
        } else {
          console.log('⚠️ Description column still exists in apparatus');
        }
      }
    }

    // Check booking_focus_areas junction table
    const { data: bookingFocusAreas, error: bfaError } = await supabase
      .from('booking_focus_areas')
      .select('*')
      .limit(1);
    
    if (bfaError) {
      console.log('❌ booking_focus_areas table does not exist:', bfaError.message);
    } else {
      console.log('✅ booking_focus_areas table exists');
      if (bookingFocusAreas && bookingFocusAreas.length > 0) {
        console.log('📋 booking_focus_areas columns:', Object.keys(bookingFocusAreas[0]));
      }
    }

  } catch (error) {
    console.error('💥 Error checking schema:', error);
  }
}

checkSchema();
