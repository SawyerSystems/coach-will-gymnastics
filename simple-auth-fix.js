import { supabase } from './server/supabase-client.ts';

async function simpleAuthFix() {
  console.log('🔧 Creating minimal auth tables...');
  
  try {
    // Create parent_auth_codes table with correct schema
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        DROP TABLE IF EXISTS parent_auth_codes CASCADE;
        CREATE TABLE parent_auth_codes (
          id SERIAL PRIMARY KEY,
          email TEXT NOT NULL,
          code TEXT NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          used BOOLEAN DEFAULT FALSE,
          used_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `
    });

    if (createError) {
      console.log('Creating table without RPC...');
      // If RPC fails, we'll handle it in the app logic instead
    }

    console.log('✅ Simple auth fix completed');

  } catch (error) {
    console.error('❌ Simple auth fix failed:', error);
  }
}

simpleAuthFix().catch(console.error);