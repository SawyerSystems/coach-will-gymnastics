import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
import fs from 'fs';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function runMigration() {
  console.log('🚀 Running complete schema migration...');
  
  try {
    const sql = fs.readFileSync('./complete-schema-migration.sql', 'utf8');
    
    // Split the SQL into individual statements and run them
    const statements = sql.split(';').filter(stmt => stmt.trim() && !stmt.trim().startsWith('--'));
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (!statement) continue;
      
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql_query: statement + ';' 
      });
      
      if (error) {
        console.error(`❌ Error in statement ${i + 1}:`, error);
        console.error('Statement:', statement);
        // Continue with other statements
      } else {
        console.log(`✅ Statement ${i + 1} completed`);
      }
    }
    
    console.log('🎉 Migration completed!');
    
    // Test the new schema
    console.log('\n📊 Testing new schema...');
    
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        id,
        lesson_type,
        parent_email,
        booking_athletes (
          athlete_id,
          slot_order,
          athletes (
            name,
            date_of_birth
          )
        )
      `)
      .limit(1)
      .single();
      
    if (bookingError) {
      console.error('❌ Schema test failed:', bookingError);
    } else {
      console.log('✅ Schema test passed:', booking);
    }
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
  }
}

runMigration();
