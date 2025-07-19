import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = 'https://nwdgtdzrcyfmislilucy.supabase.co';
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing Supabase connections...');
console.log('URL:', supabaseUrl);
console.log('Anon key exists:', !!anonKey);
console.log('Service key exists:', !!serviceKey);

// Test anon client
const anonClient = createClient(supabaseUrl, anonKey);
console.log('\n--- Testing Anon Client ---');

anonClient
  .from('admins')
  .select('count')
  .then(result => {
    console.log('Anon client result:', result);
  })
  .catch(err => {
    console.log('Anon client error:', err.message);
  });

// Test service role client
const serviceClient = createClient(supabaseUrl, serviceKey);
console.log('\n--- Testing Service Role Client ---');

serviceClient
  .from('admins')
  .select('count')
  .then(result => {
    console.log('Service client result:', result);
  })
  .catch(err => {
    console.log('Service client error:', err.message);
  });
