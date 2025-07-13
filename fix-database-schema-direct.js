import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Create Supabase client using anon key (may need service role for schema changes)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function fixDatabaseSchema() {
  console.log('🔍 Checking current athletes table schema...');
  
  try {
    // First, check current schema
    const { data: columns, error: schemaError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'athletes')
      .eq('table_schema', 'public');

    if (schemaError) {
      console.error('❌ Error checking schema:', schemaError);
      return;
    }

    console.log('📋 Current athletes table columns:');
    columns?.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // Check if gender column exists
    const hasGenderColumn = columns?.some(col => col.column_name === 'gender');
    
    if (hasGenderColumn) {
      console.log('✅ Gender column already exists!');
      return;
    }

    console.log('\n🔧 Adding gender column to athletes table...');
    
    // Add gender column using RPC call
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.athletes ADD COLUMN gender text;'
    });

    if (error) {
      console.error('❌ Error adding gender column via RPC:', error);
      
      // Try alternative approach using raw SQL
      console.log('\n🔄 Trying alternative approach...');
      
      const { error: directError } = await supabase
        .from('athletes')
        .select('*')
        .limit(0); // This will fail but might give us insight
      
      console.log('Direct query error (for debugging):', directError);
      
      // Try using pg_meta service
      console.log('\n🔄 Attempting to use Supabase management API...');
      
      const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY
        },
        body: JSON.stringify({
          sql: 'ALTER TABLE public.athletes ADD COLUMN gender text;'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Management API error:', response.status, errorText);
      } else {
        const result = await response.json();
        console.log('✅ Management API result:', result);
      }
      
    } else {
      console.log('✅ Gender column added successfully!', data);
    }

    // Verify the change
    console.log('\n🔍 Verifying schema changes...');
    const { data: updatedColumns, error: verifyError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'athletes')
      .eq('table_schema', 'public');

    if (verifyError) {
      console.error('❌ Error verifying schema:', verifyError);
    } else {
      console.log('📋 Updated athletes table columns:');
      updatedColumns?.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
      
      const stillHasGender = updatedColumns?.some(col => col.column_name === 'gender');
      console.log(stillHasGender ? '✅ Gender column confirmed added!' : '❌ Gender column still missing');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Also provide manual SQL command
console.log('🎯 MANUAL FIX INSTRUCTIONS:');
console.log('If this script fails, manually run this SQL in Supabase Dashboard:');
console.log('ALTER TABLE public.athletes ADD COLUMN gender text;');
console.log('');

fixDatabaseSchema().then(() => {
  console.log('\n🏁 Schema fix attempt completed.');
  process.exit(0);
}).catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
