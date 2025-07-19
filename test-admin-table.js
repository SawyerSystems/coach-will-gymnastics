import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = 'https://nwdgtdzrcyfmislilucy.supabase.co';
const anonKey = process.env.SUPABASE_ANON_KEY;

console.log('Testing admin table with anon client...');

const anonClient = createClient(supabaseUrl, anonKey);

// Test basic table access
console.log('\n--- Testing table access ---');
anonClient
  .from('admins')
  .select('*')
  .limit(1)
  .then(result => {
    console.log('Select result:', result);
    
    // Test insert
    return anonClient
      .from('admins')
      .insert({
        email: 'test@example.com',
        password_hash: 'test_hash',
        created_at: new Date().toISOString()
      })
      .select();
  })
  .then(insertResult => {
    console.log('Insert result:', insertResult);
  })
  .catch(err => {
    console.log('Error:', err);
  });
