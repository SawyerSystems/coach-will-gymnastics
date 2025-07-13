import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function runMigration() {
  console.log('🚀 Running schema migration using Supabase API...');
  
  try {
    // First, let's check if the booking_athletes table exists
    console.log('📊 Checking current schema...');
    
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, lesson_type, parent_email, athlete1_name, athlete2_name')
      .limit(1);
      
    if (bookingsError) {
      console.error('❌ Error accessing bookings:', bookingsError);
      return;
    }
    
    console.log('✅ Found', bookings.length, 'booking(s) in database');
    
    // Check if booking_athletes table exists
    const { data: athleteLinks, error: athleteLinksError } = await supabase
      .from('booking_athletes')
      .select('*')
      .limit(1);
      
    if (athleteLinksError) {
      console.log('📝 booking_athletes table not accessible, need to run SQL migration');
      console.log('❌ Error:', athleteLinksError);
    } else {
      console.log('✅ booking_athletes table exists with', athleteLinks.length, 'records');
    }
    
    // Check if focus_areas table exists
    const { data: focusAreas, error: focusAreasError } = await supabase
      .from('focus_areas')
      .select('*')
      .limit(1);
      
    if (focusAreasError) {
      console.log('📝 focus_areas table not accessible');
      console.log('❌ Error:', focusAreasError);
    } else {
      console.log('✅ focus_areas table exists with', focusAreas.length, 'records');
    }
    
    // Let's see what tables we can access
    console.log('\n🔍 Testing accessible tables...');
    
    const tables = ['bookings', 'parents', 'athletes', 'booking_athletes', 'focus_areas', 'booking_focus_areas'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
          
        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: accessible (${data.length} records)`);
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`);
      }
    }
    
  } catch (error) {
    console.error('💥 Migration check failed:', error);
  }
}

runMigration();
