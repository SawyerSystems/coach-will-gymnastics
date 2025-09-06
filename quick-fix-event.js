import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function quickFix() {
  console.log('🔧 Quick fix for No Open Gym event...');
  
  const { data: event, error } = await supabase
    .from('events')
    .update({
      start_at: '2025-09-07T00:00:00.000Z',
      end_at: '2025-09-07T23:59:59.999Z'
    })
    .eq('title', 'No Open Gym')
    .eq('is_all_day', true)
    .select('*')
    .single();
    
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('✅ Fixed event:');
    console.log(`   ${event.title}: ${event.start_at} to ${event.end_at}`);
    console.log(`   All day: ${event.is_all_day}, Blocking: ${event.is_availability_block}`);
  }
  
  // Test availability for Sep 7th
  console.log('\n🔍 Testing availability for Sep 7th...');
  try {
    const response = await fetch('http://localhost:5001/api/available-times?date=2025-09-07&lessonType=Quick%20Journey');
    const times = await response.json();
    console.log(`Available times for Sep 7th: ${times.length} slots`);
    if (times.length > 0) {
      console.log('❌ Still showing available times:', times.slice(0, 3));
    } else {
      console.log('✅ No available times (correctly blocked)');
    }
  } catch (err) {
    console.error('Error checking availability:', err.message);
  }
}

quickFix();
