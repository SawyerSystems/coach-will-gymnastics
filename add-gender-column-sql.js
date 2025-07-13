import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

async function addGenderColumn() {
  console.log('🚀 Starting database schema migration for gender column...');
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for schema changes
  );

  try {
    console.log('🔧 Adding gender column to athletes table...');
    
    // Use RPC to execute SQL directly
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.athletes 
        ADD COLUMN IF NOT EXISTS gender TEXT;
        
        -- Add check constraint for valid gender values
        ALTER TABLE public.athletes 
        ADD CONSTRAINT IF NOT EXISTS check_gender_values 
        CHECK (gender IN ('Male', 'Female', 'Other') OR gender IS NULL);
      `
    });
    
    if (error) {
      console.log('❌ RPC method failed, trying direct SQL execution...');
      
      // Try using the REST API to execute SQL
      const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY
        },
        body: JSON.stringify({
          sql: `
            ALTER TABLE public.athletes 
            ADD COLUMN IF NOT EXISTS gender TEXT;
            
            ALTER TABLE public.athletes 
            ADD CONSTRAINT IF NOT EXISTS check_gender_values 
            CHECK (gender IN ('Male', 'Female', 'Other') OR gender IS NULL);
          `
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Direct SQL execution failed:', errorText);
        
        // Final attempt: Use SQL editor syntax
        console.log('🔄 Trying SQL editor approach...');
        const sqlResponse = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY
          },
          body: JSON.stringify({
            query: `
              ALTER TABLE public.athletes 
              ADD COLUMN IF NOT EXISTS gender TEXT;
              
              ALTER TABLE public.athletes 
              ADD CONSTRAINT IF NOT EXISTS check_gender_values 
              CHECK (gender IN ('Male', 'Female', 'Other') OR gender IS NULL);
            `
          })
        });
        
        if (!sqlResponse.ok) {
          const sqlErrorText = await sqlResponse.text();
          console.log('❌ SQL editor approach failed:', sqlErrorText);
          throw new Error('All SQL execution methods failed');
        }
        
        console.log('✅ Gender column added successfully via SQL editor!');
      } else {
        console.log('✅ Gender column added successfully via direct SQL!');
      }
    } else {
      console.log('✅ Gender column added successfully via RPC!');
    }

    // Verify the column was added
    console.log('🔍 Verifying gender column was added...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('athletes')
      .select('id, gender')
      .limit(1);

    if (verifyError) {
      console.log('❌ Verification failed:', verifyError);
      return false;
    }

    console.log('✅ Gender column verification successful!');
    console.log('🎉 Database schema migration completed successfully!');
    
    return true;

  } catch (error) {
    console.error('❌ Error in schema migration:', error);
    return false;
  }
}

addGenderColumn()
  .then(success => {
    if (success) {
      console.log('🚀 Ready to re-enable gender field in application code!');
      process.exit(0);
    } else {
      console.log('❌ Schema migration failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
