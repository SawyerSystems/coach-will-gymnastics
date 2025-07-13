const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkBookingSchema() {
  try {
    console.log('Checking booking table schema...');
    
    // Try to select all columns from an empty booking table to see structure
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    console.log('Booking table columns:');
    if (data && data.length > 0) {
      console.log('Sample data structure:', Object.keys(data[0]));
    } else {
      console.log('No data found, but table exists');
    }
    
    // Also check the table structure via RPC
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_schema', { table_name: 'bookings' });
    
    if (tableError) {
      console.log('RPC error (expected):', tableError.message);
    } else {
      console.log('Table schema:', tableInfo);
    }
    
  } catch (error) {
    console.error('Error checking schema:', error);
  }
}

checkBookingSchema();