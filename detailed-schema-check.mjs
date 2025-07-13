import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function getTableSchema() {
  console.log('🔍 Getting detailed table schemas...\n');
  
  try {
    // Check if old columns still exist in bookings
    const { data: sampleBooking, error } = await supabase
      .from('bookings')
      .select('*')
      .limit(1);
    
    if (sampleBooking && sampleBooking.length > 0) {
      const columns = Object.keys(sampleBooking[0]);
      console.log('📋 Current BOOKINGS table columns:');
      console.log(columns.join(', '));
      
      // Check if old athlete columns exist
      const hasOldColumns = columns.some(col => col.includes('athlete1') || col.includes('athlete2'));
      console.log('\n🔍 Has old athlete columns?', hasOldColumns ? '✅ YES' : '❌ NO');
      
      if (hasOldColumns) {
        const oldCols = columns.filter(col => col.includes('athlete1') || col.includes('athlete2'));
        console.log('📋 Old athlete columns found:', oldCols.join(', '));
      }
    } else {
      console.log('📋 No booking data found, checking schema differently...');
      
      // Insert a test record to see the schema
      const testBooking = {
        lesson_type: 'quick-journey',
        preferred_date: '2025-07-15',
        preferred_time: '10:00',
        parent_first_name: 'Test',
        parent_last_name: 'Parent',
        parent_email: 'test@example.com',
        parent_phone: '555-0123',
        emergency_contact_name: 'Emergency Contact',
        emergency_contact_phone: '555-0456',
        amount: '40.00',
        focus_areas: []
      };
      
      const { data: insertedBooking, error: insertError } = await supabase
        .from('bookings')
        .insert(testBooking)
        .select()
        .single();
      
      if (insertError) {
        console.log('❌ Insert failed - this tells us about the schema:');
        console.log(insertError.message);
      } else {
        console.log('✅ Test booking created, columns:');
        console.log(Object.keys(insertedBooking).join(', '));
        
        // Clean up test booking
        await supabase.from('bookings').delete().eq('id', insertedBooking.id);
      }
    }

    // Check booking_athletes schema
    const { data: sampleBA } = await supabase
      .from('booking_athletes')
      .select('*')
      .limit(1);
    
    if (sampleBA && sampleBA.length > 0) {
      console.log('\n📋 BOOKING_ATHLETES table columns:');
      console.log(Object.keys(sampleBA[0]).join(', '));
    }

    // Check athletes schema
    const { data: sampleAthlete } = await supabase
      .from('athletes')
      .select('*')
      .limit(1);
    
    if (sampleAthlete && sampleAthlete.length > 0) {
      console.log('\n📋 ATHLETES table columns:');
      console.log(Object.keys(sampleAthlete[0]).join(', '));
    }

  } catch (error) {
    console.error('💥 Error:', error);
  }
}

getTableSchema();
