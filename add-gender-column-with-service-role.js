import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = "***REMOVED***";

if (!supabaseUrl) {
  console.error('Missing SUPABASE_URL');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function addGenderColumnToAthletes() {
  try {
    console.log('🔧 Adding gender column to athletes table...');
    
    // Execute raw SQL to add the gender column
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add gender column to athletes table if it doesn't exist
        ALTER TABLE athletes ADD COLUMN IF NOT EXISTS gender text;
        
        -- Create an index on gender for better query performance
        CREATE INDEX IF NOT EXISTS idx_athletes_gender ON athletes(gender);
        
        -- Check the updated table structure
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'athletes' 
        ORDER BY ordinal_position;
      `
    });
    
    if (error) {
      console.error('❌ Error adding gender column:', error);
      
      // Fallback: Try direct SQL execution
      console.log('🔄 Trying alternative approach...');
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('athletes')
        .select('id, name, gender')
        .limit(1);
        
      if (fallbackError) {
        console.error('❌ Athletes table access error:', fallbackError);
        process.exit(1);
      }
      
      console.log('✅ Athletes table is accessible');
      console.log('Sample record:', fallbackData[0]);
      
      if (fallbackData[0] && 'gender' in fallbackData[0]) {
        console.log('✅ Gender column already exists!');
      } else {
        console.log('❌ Gender column still missing - manual intervention required');
        process.exit(1);
      }
    } else {
      console.log('✅ Gender column added successfully!');
      console.log('Database schema update result:', data);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

async function verifyGenderColumn() {
  try {
    console.log('🔍 Verifying gender column exists...');
    
    const { data, error } = await supabase
      .from('athletes')
      .select('id, name, first_name, last_name, gender')
      .limit(3);
      
    if (error) {
      console.error('❌ Verification failed:', error);
      return false;
    }
    
    console.log('✅ Gender column verification successful!');
    console.log('Sample athletes with gender field:', data);
    return true;
  } catch (error) {
    console.error('❌ Verification error:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting database schema migration for gender column...');
  
  await addGenderColumnToAthletes();
  await verifyGenderColumn();
  
  console.log('✅ Schema migration completed successfully!');
}

main().catch(console.error);
