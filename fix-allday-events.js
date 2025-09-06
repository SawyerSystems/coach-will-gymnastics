import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fixExistingAllDayEvents() {
  console.log('🔧 Fixing existing all-day events with incorrect times...\n');

  try {
    // Find all events marked as all-day
    const { data: allDayEvents, error: fetchError } = await supabase
      .from('events')
      .select('*')
      .eq('is_all_day', true)
      .eq('is_deleted', false);

    if (fetchError) {
      console.error('Error fetching all-day events:', fetchError);
      return;
    }

    console.log(`Found ${allDayEvents.length} all-day events to potentially fix:`);

    for (const event of allDayEvents) {
      console.log(`\n📅 Event: ${event.title}`);
      console.log(`   Current times: ${event.start_at} to ${event.end_at}`);
      
      // Extract the date from the start time
      const eventDate = new Date(event.start_at);
      
      // Create proper all-day times (00:00:00 to 23:59:59)
      const startOfDay = new Date(eventDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      
      const endOfDay = new Date(eventDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      
      const newStartAt = startOfDay.toISOString();
      const newEndAt = endOfDay.toISOString();
      
      console.log(`   Should be: ${newStartAt} to ${newEndAt}`);
      
      // Check if it needs fixing
      if (event.start_at !== newStartAt || event.end_at !== newEndAt) {
        console.log(`   ⚠️  Needs fixing!`);
        
        // Update the event
        const { data: updated, error: updateError } = await supabase
          .from('events')
          .update({
            start_at: newStartAt,
            end_at: newEndAt,
            updated_at: new Date().toISOString()
          })
          .eq('id', event.id)
          .select('*')
          .single();
          
        if (updateError) {
          console.error(`   ❌ Error updating event ${event.id}:`, updateError);
        } else {
          console.log(`   ✅ Fixed! Updated to: ${updated.start_at} to ${updated.end_at}`);
        }
      } else {
        console.log(`   ✅ Already correct!`);
      }
    }
    
    console.log('\n🎉 All-day events fix complete!');
    
    // Test the availability check after fixing
    console.log('\n🔍 Testing availability check for September 7th after fix...');
    const { data: blockedEvents } = await supabase
      .from('events')
      .select('*')
      .eq('is_availability_block', true)
      .gte('start_at', '2025-09-07T00:00:00Z')
      .lte('start_at', '2025-09-07T23:59:59Z');
      
    console.log(`Found ${blockedEvents?.length || 0} blocking events on Sep 7th:`);
    blockedEvents?.forEach(event => {
      console.log(`  - ${event.title}: ${event.start_at} to ${event.end_at}`);
      console.log(`    All day: ${event.is_all_day}, Blocking: ${event.is_availability_block}`);
    });

  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

fixExistingAllDayEvents();
