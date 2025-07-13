import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function testSchemaAccuracy() {
  console.log('🔍 Testing exact schema structure...');
  
  try {
    // Test focus_areas with minimal columns
    console.log('📝 Testing focus_areas with minimal fields...');
    const { data: focusArea, error: focusAreaError } = await supabase
      .from('focus_areas')
      .insert([
        {
          name: 'Test Skill ' + Date.now()
        }
      ])
      .select()
      .single();
      
    if (focusAreaError) {
      console.error('❌ Focus area creation failed:', focusAreaError);
    } else {
      console.log('✅ Focus areas table working:', focusArea);
      
      // Clean up test data
      await supabase
        .from('focus_areas')
        .delete()
        .eq('id', focusArea.id);
    }
    
    // Test booking_athletes
    console.log('📝 Testing booking_athletes structure...');
    const { data: bookingAthletes, error: baError } = await supabase
      .from('booking_athletes')
      .select('*')
      .limit(1);
      
    if (baError) {
      console.error('❌ booking_athletes issue:', baError);
    } else {
      console.log('✅ booking_athletes accessible, found', bookingAthletes.length, 'records');
    }
    
    // Test athletes table
    console.log('📝 Testing athletes table...');
    const { data: athletes, error: athletesError } = await supabase
      .from('athletes')
      .select('*')
      .limit(1);
      
    if (athletesError) {
      console.error('❌ athletes issue:', athletesError);
    } else {
      console.log('✅ athletes accessible, found', athletes.length, 'records');
    }
    
    // Test parents table
    console.log('📝 Testing parents table...');
    const { data: parents, error: parentsError } = await supabase
      .from('parents')
      .select('*')
      .limit(1);
      
    if (parentsError) {
      console.error('❌ parents issue:', parentsError);
    } else {
      console.log('✅ parents accessible, found', parents.length, 'records');
    }
    
    // Now let's test our modern storage
    console.log('📝 Testing modern storage compatibility...');
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        id,
        lesson_type,
        preferred_date,
        preferred_time,
        parent_first_name,
        parent_last_name,
        parent_email
      `)
      .limit(1);
      
    if (bookingsError) {
      console.error('❌ bookings structure issue:', bookingsError);
    } else {
      console.log('✅ bookings structure compatible');
      
      if (bookings.length > 0) {
        console.log('📋 Sample booking:', bookings[0]);
      }
    }
    
  } catch (error) {
    console.error('💥 Schema test failed:', error);
  }
}

testSchemaAccuracy();
