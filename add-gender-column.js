import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addGenderColumn() {
  try {
    console.log('Adding gender column to athletes table...');
    
    // Use rpc to execute raw SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE athletes ADD COLUMN IF NOT EXISTS gender text;'
    });
    
    if (error) {
      console.error('Error adding gender column:', error);
      // Try alternative approach using direct SQL
      const { data: alterData, error: alterError } = await supabase
        .from('athletes')
        .select('*')
        .limit(1);
        
      if (alterError) {
        console.error('Athletes table query error:', alterError);
      } else {
        console.log('Sample athlete record:', alterData[0]);
        console.log('Checking if gender column exists...');
        
        if (alterData[0] && !('gender' in alterData[0])) {
          console.log('Gender column missing - need to add it via Supabase dashboard or direct SQL access');
        } else {
          console.log('Gender column already exists!');
        }
      }
    } else {
      console.log('Gender column added successfully:', data);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

addGenderColumn();
