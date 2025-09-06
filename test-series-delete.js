import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testSeriesEventDeletion() {
  try {
    // Check if the event we tried to delete is still there
    const { data: eventCheck, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', 'beec0209-f006-4aee-8447-1aab5d83a234')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking event:', error);
      return;
    }

    if (!eventCheck) {
      console.log('✅ Event was successfully deleted (not found)');
    } else {
      console.log('❌ Event still exists after deletion attempt');
      console.log('Event status:', {
        id: eventCheck.id,
        is_deleted: eventCheck.is_deleted,
        title: eventCheck.title,
        series_id: eventCheck.series_id,
        start_at: eventCheck.start_at
      });
    }

  } catch (err) {
    console.error('Test failed:', err);
  }
}

testSeriesEventDeletion();
