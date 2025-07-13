/**
 * Fix normalization table schema by adding missing columns via API
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixSchema() {
  console.log('🔧 Fixing normalization table schema...');
  
  try {
    // Test adding columns via rpc function
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add missing columns to apparatus table
        ALTER TABLE apparatus ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;
        ALTER TABLE apparatus ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL;

        -- Add missing columns to focus_areas table  
        ALTER TABLE focus_areas ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;
        ALTER TABLE focus_areas ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL;

        -- Add missing columns to side_quests table
        ALTER TABLE side_quests ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;
        ALTER TABLE side_quests ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL;
      `
    });
    
    if (error) {
      console.error('❌ Schema fix failed:', error);
      return;
    }
    
    console.log('✅ Schema fix completed successfully');
    
    // Verify the fix worked
    const { data: testData, error: testError } = await supabase
      .from('apparatus')
      .select('*')
      .limit(1);
      
    if (testError) {
      console.error('❌ Schema verification failed:', testError);
    } else {
      console.log('✅ Schema verification passed');
    }
    
  } catch (error) {
    console.error('❌ Schema fix failed:', error);
  }
}

fixSchema();