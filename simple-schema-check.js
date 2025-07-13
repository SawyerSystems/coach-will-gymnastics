// Simple database schema check using basic Node.js
import { createClient } from '@supabase/supabase-js';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('Checking database schema...');
  
  // Check if bookings table has focus_areas column
  const bookingsTest = await supabase
    .from('bookings')
    .select('*')
    .limit(1);
    
  console.log('Bookings table query:', bookingsTest.error ? `Error: ${bookingsTest.error.message}` : 'Success');
  
  // Check if normalization tables exist
  const tables = ['booking_focus_areas', 'focus_areas', 'apparatus', 'booking_apparatus'];
  
  for (const table of tables) {
    const test = await supabase
      .from(table)
      .select('*')
      .limit(1);
      
    console.log(`${table} table:`, test.error ? `Error: ${test.error.message}` : 'Exists');
  }
  
  // Check if bookings has the old columns
  const oldColumnsTest = await supabase
    .from('bookings')
    .select('focus_areas, apparatus, side_quests')
    .limit(1);
    
  console.log('Old columns test:', oldColumnsTest.error ? `Error: ${oldColumnsTest.error.message}` : 'Old columns exist');
}

checkSchema().catch(console.error);
