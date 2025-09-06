import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testAvailability() {
  console.log('🔍 Testing availability directly via database for Sep 7th...\n');
  
  // First, verify the event is correctly stored
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('title', 'No Open Gym')
    .eq('is_all_day', true)
    .single();
    
  if (events) {
    console.log('✅ Event found:');
    console.log(`   Title: ${events.title}`);
    console.log(`   Start: ${events.start_at}`);
    console.log(`   End: ${events.end_at}`);
    console.log(`   All day: ${events.is_all_day}`);
    console.log(`   Blocking: ${events.is_availability_block}`);
    
    // Extract the date from start_at
    const eventDate = new Date(events.start_at);
    const dateStr = eventDate.toISOString().split('T')[0];
    console.log(`   Event date: ${dateStr}`);
    
    // Check if 2025-09-07 matches
    if (dateStr === '2025-09-07') {
      console.log('✅ Event is correctly on 2025-09-07');
      
      // Check time range - should be full day
      const startTime = new Date(events.start_at);
      const endTime = new Date(events.end_at);
      
      console.log(`   Start time: ${startTime.getUTCHours()}:${startTime.getUTCMinutes().toString().padStart(2, '0')}`);
      console.log(`   End time: ${endTime.getUTCHours()}:${endTime.getUTCMinutes().toString().padStart(2, '0')}`);
      
      if (startTime.getUTCHours() === 0 && startTime.getUTCMinutes() === 0 && 
          endTime.getUTCHours() === 23 && endTime.getUTCMinutes() === 59) {
        console.log('✅ Event correctly covers full day (00:00 to 23:59)');
      } else {
        console.log('❌ Event does NOT cover full day properly');
      }
      
    } else {
      console.log(`❌ Event date mismatch! Expected 2025-09-07, got ${dateStr}`);
    }
    
  } else {
    console.log('❌ No Open Gym event not found');
  }
  
  // Test server endpoint directly
  console.log('\n🌐 Testing server endpoint...');
  try {
    const response = await fetch('http://localhost:5001/api/available-times?date=2025-09-07&lessonType=Quick%20Journey', {
      headers: {
        'Content-Type': 'application/json',
        // Try without authentication to see if that's the issue
      }
    });
    
    console.log(`Response status: ${response.status}`);
    const contentType = response.headers.get('content-type');
    console.log(`Content-Type: ${contentType}`);
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('API Response:', data);
      
      if (Array.isArray(data)) {
        console.log(`Available times count: ${data.length}`);
        if (data.length === 0) {
          console.log('✅ No available times - blocking is working!');
        } else {
          console.log('❌ Available times found - blocking is NOT working:', data);
        }
      }
    } else {
      console.log('❌ Response is not JSON (probably HTML login page)');
    }
    
  } catch (error) {
    console.error('❌ API call failed:', error.message);
  }
}

testAvailability();
