import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

async function testDatabase() {
  console.log('🔍 Database Schema Analysis');
  console.log('============================');
  
  // Test focus_areas table (should exist and work)
  try {
    const { data: focusAreas, error: focusError } = await supabase
      .from('focus_areas')
      .select('*')
      .limit(3);
      
    if (focusError) {
      console.log('❌ focus_areas error:', focusError.message);
    } else {
      console.log('✅ focus_areas table working, sample:', focusAreas?.[0]);
    }
  } catch (e) {
    console.log('💥 focus_areas exception:', e);
  }
  
  // Test bookings table structure
  try {
    const { data: bookings, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .limit(1);
      
    if (bookingError) {
      console.log('❌ bookings error:', bookingError.message);
    } else {
      console.log('✅ bookings table exists');
      if (bookings && bookings.length > 0) {
        console.log('   Sample columns:', Object.keys(bookings[0]).slice(0, 15));
      } else {
        console.log('   Table is empty');
      }
    }
  } catch (e) {
    console.log('💥 bookings exception:', e);
  }
  
  // Test normalized tables
  try {
    const { data: bookingAthletes, error: baError } = await supabase
      .from('booking_athletes')
      .select('*')
      .limit(1);
      
    if (baError) {
      console.log('❌ booking_athletes error:', baError.message);
    } else {
      console.log('✅ booking_athletes table exists');
    }
  } catch (e) {
    console.log('💥 booking_athletes exception:', e);
  }
  
  // Test simple insert to see what schema is expected
  console.log('\n🧪 Testing Simple Booking Insert');
  console.log('==================================');
  
  const testBooking = {
    lesson_type: 'quick-journey',
    preferred_date: '2025-07-16',
    preferred_time: '10:00',
    parent_first_name: 'Test',
    parent_last_name: 'Parent',
    parent_email: `schema.test.${Date.now()}@example.com`,
    parent_phone: '555-0000',
    amount: '40.00',
    status: 'pending'
  };
  
  try {
    const { data: insertResult, error: insertError } = await supabase
      .from('bookings')
      .insert(testBooking)
      .select()
      .single();
      
    if (insertError) {
      console.log('❌ Insert failed:', insertError.message);
      console.log('   Details:', insertError.details);
      console.log('   Hint:', insertError.hint);
    } else {
      console.log('✅ Insert successful:', insertResult?.id);
      
      // Clean up
      await supabase.from('bookings').delete().eq('id', insertResult.id);
      console.log('✅ Test record cleaned up');
    }
  } catch (e) {
    console.log('💥 Insert exception:', e);
  }
}

testDatabase();
