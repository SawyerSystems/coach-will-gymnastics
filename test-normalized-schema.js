import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function setupNormalizedSchema() {
  console.log('🚀 Setting up normalized schema...');
  
  try {
    // Check current bookings structure
    console.log('📊 Checking bookings table...');
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, lesson_type, parent_email')
      .limit(1);
      
    if (bookingsError) {
      console.error('❌ Cannot access bookings:', bookingsError);
      return;
    }
    
    console.log('✅ Bookings table accessible');
    
    // Try to create a focus area
    console.log('📝 Setting up focus areas...');
    const { data: focusArea, error: focusAreaError } = await supabase
      .from('focus_areas')
      .insert([
        {
          name: 'Cartwheel',
          description: 'Basic cartwheel technique',
          sort_order: 1
        }
      ])
      .select()
      .single();
      
    if (focusAreaError && focusAreaError.code !== '23505') { // 23505 = duplicate key
      console.error('❌ Focus area creation failed:', focusAreaError);
    } else {
      console.log('✅ Focus areas table working');
    }
    
    // Try to create test athlete and link
    console.log('📝 Testing booking_athletes table...');
    
    if (bookings.length > 0) {
      const { data: athleteLink, error: athleteLinkError } = await supabase
        .from('booking_athletes')
        .select('*')
        .eq('booking_id', bookings[0].id)
        .limit(1);
        
      if (athleteLinkError) {
        console.error('❌ booking_athletes table issue:', athleteLinkError);
      } else {
        console.log('✅ booking_athletes table accessible, found', athleteLink.length, 'links');
      }
    }
    
    console.log('🎉 Schema check completed!');
    
  } catch (error) {
    console.error('💥 Setup failed:', error);
  }
}

setupNormalizedSchema();
