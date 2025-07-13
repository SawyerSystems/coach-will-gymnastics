import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function testModernStorage() {
  console.log('🧪 Testing modern storage implementation...');
  
  try {
    // Test booking retrieval with modern schema
    console.log('📋 Testing booking retrieval...');
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        id,
        lesson_type,
        preferred_date,
        preferred_time,
        parent_first_name,
        parent_last_name,
        parent_email,
        booking_athletes (
          slot_order,
          athletes (
            id,
            name,
            first_name,
            last_name,
            date_of_birth
          )
        )
      `)
      .limit(3);
      
    if (bookingsError) {
      console.error('❌ Booking query failed:', bookingsError);
    } else {
      console.log('✅ Booking query successful');
      console.log('📊 Found', bookings.length, 'bookings');
      
      if (bookings.length > 0) {
        const booking = bookings[0];
        console.log('📝 Sample booking:', {
          id: booking.id,
          lessonType: booking.lesson_type,
          athleteCount: booking.booking_athletes?.length || 0
        });
        
        if (booking.booking_athletes && booking.booking_athletes.length > 0) {
          console.log('👥 Athletes:', booking.booking_athletes.map(ba => ({
            name: ba.athletes?.name,
            slot: ba.slot_order
          })));
        }
      }
    }
    
    // Test focus areas
    console.log('\n🎯 Testing focus areas...');
    const { data: focusAreas, error: faError } = await supabase
      .from('focus_areas')
      .select('*')
      .limit(5);
      
    if (faError) {
      console.error('❌ Focus areas query failed:', faError);
    } else {
      console.log('✅ Focus areas query successful');
      console.log('📊 Found', focusAreas.length, 'focus areas');
      if (focusAreas.length > 0) {
        console.log('🎯 Sample focus areas:', focusAreas.map(fa => fa.name));
      }
    }
    
    // Test apparatus
    console.log('\n🤸 Testing apparatus...');
    const { data: apparatus, error: appError } = await supabase
      .from('apparatus')
      .select('*')
      .limit(5);
      
    if (appError) {
      console.error('❌ Apparatus query failed:', appError);
    } else {
      console.log('✅ Apparatus query successful');
      console.log('📊 Found', apparatus.length, 'apparatus');
      if (apparatus.length > 0) {
        console.log('🤸 Sample apparatus:', apparatus.map(app => app.name));
      }
    }
    
    console.log('\n🎉 Schema test completed!');
    
  } catch (error) {
    console.error('💥 Schema test failed:', error);
  }
}

testModernStorage();
