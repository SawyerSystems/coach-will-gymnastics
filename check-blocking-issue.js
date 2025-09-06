import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkBlockingIssue() {
  console.log('🔍 Checking Blocking Issue for September 6, 2025\n');

  // First, let's see ALL events in September 2025
  console.log('📅 All events in September 2025:');
  const { data: septEvents, error: septError } = await supabase
    .from('events')
    .select('*')
    .gte('start_at', '2025-09-01T00:00:00')
    .lte('start_at', '2025-09-30T23:59:59')
    .order('start_at', { ascending: true });

  if (septError) {
    console.error('Error fetching Sept events:', septError);
  } else {
    console.log(`Found ${septEvents.length} events in September 2025:`);
    septEvents.forEach(event => {
      console.log(`  - ${event.title}: ${event.start_at} to ${event.end_at}`);
      console.log(`    Blocking: ${event.is_availability_block}, All day: ${event.is_all_day}`);
      console.log(`    Reason: ${event.blocking_reason}`);
      console.log('');
    });
  }

  // Check for events containing "OPEN GYM" 
  console.log('\n🏃‍♂️ Events containing "OPEN GYM":');
  const { data: openGymEvents, error: gymError } = await supabase
    .from('events')
    .select('*')
    .ilike('title', '%OPEN GYM%')
    .order('start_at', { ascending: false })
    .limit(5);

  if (gymError) {
    console.error('Error fetching Open Gym events:', gymError);
  } else {
    console.log(`Found ${openGymEvents.length} Open Gym events:`);
    openGymEvents.forEach(event => {
      console.log(`  - ${event.title}: ${event.start_at} to ${event.end_at}`);
      console.log(`    Blocking: ${event.is_availability_block}, All day: ${event.is_all_day}`);
      console.log(`    Reason: ${event.blocking_reason}`);
      console.log('');
    });
  }

  // Test the availability check for Sep 6th directly
  console.log('\n🔍 Testing availability API call for 2025-09-06:');
  try {
    const response = await fetch('http://localhost:5001/api/available-times?date=2025-09-06&lessonType=Quick%20Journey');
    if (!response.ok) {
      console.error('API call failed:', response.status, response.statusText);
    } else {
      const availableTimes = await response.json();
      console.log('Available times returned:', availableTimes);
    }
  } catch (error) {
    console.error('Error calling API:', error.message);
  }

  // Check the booking that went through
  console.log('\n📋 Checking booking #245 details:');
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', 245)
    .single();

  if (bookingError) {
    console.error('Error fetching booking:', bookingError);
  } else {
    console.log('Booking details:');
    console.log(`  ID: ${booking.id}`);
    console.log(`  Date: ${booking.preferred_date}`);
    console.log(`  Time: ${booking.preferred_time}`);
    console.log(`  Created: ${booking.created_at}`);
    console.log(`  Status: ${booking.status}`);
  }
}

checkBlockingIssue();
