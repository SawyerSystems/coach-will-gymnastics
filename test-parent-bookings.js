import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('Testing parent bookings endpoint directly...');

async function testParentBookings() {
  try {
    // Test with the same logic as the endpoint
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('✅ Supabase admin client created');
    
    const parentId = 49;
    console.log(`🔍 Testing bookings query for parent ${parentId}...`);
    
    // Simple query first
    console.log('📊 Simple bookings query...');
    const simpleQuery = await supabaseAdmin
      .from('bookings')
      .select('id, parent_id, status, attendance_status')
      .eq('parent_id', parentId);
      
    console.log(`📊 Simple query result:`, {
      error: simpleQuery.error,
      dataLength: simpleQuery.data?.length,
      data: simpleQuery.data
    });
    
    if (simpleQuery.error) {
      console.error('❌ Simple query error:', simpleQuery.error);
      return;
    }
    
    // Complex query with joins
    console.log('🔗 Complex query with joins...');
    const complexQuery = await supabaseAdmin
      .from('bookings')
      .select(`
        *,
        booking_athletes (
          athlete_id,
          slot_order,
          athletes:athlete_id (
            id,
            name,
            first_name,
            last_name,
            date_of_birth,
            allergies,
            experience,
            gender,
            parent_id
          )
        )
      `)
      .eq('parent_id', parentId)
      .order('created_at', { ascending: false });
      
    console.log(`🔗 Complex query result:`, {
      error: complexQuery.error,
      dataLength: complexQuery.data?.length,
      data: complexQuery.data
    });
    
    if (complexQuery.error) {
      console.error('❌ Complex query error:', complexQuery.error);
      return;
    }
    
    console.log('✅ Test completed successfully');
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

testParentBookings();
