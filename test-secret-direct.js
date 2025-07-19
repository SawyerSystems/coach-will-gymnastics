import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = 'https://nwdgtdzrcyfmislilucy.supabase.co';
const secretKey = process.env.SUPABASE_SECRET_KEY;

console.log('Testing Supabase secret key as auth header...');

async function testSecretKeyAsHeader() {
  if (!secretKey) {
    console.log('❌ No secret key provided');
    return;
  }

  try {
    // Test using secret key in Authorization header
    const response = await fetch(`${supabaseUrl}/rest/v1/admins?select=count`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'apikey': secretKey,
        'Content-Type': 'application/json'
      }
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Secret key works via fetch:', data);
    } else {
      const errorText = await response.text();
      console.log('❌ Secret key failed via fetch:', errorText);
    }

  } catch (error) {
    console.log('❌ Fetch error:', error.message);
  }
  
  // Test with secret key as API key directly
  console.log('\n--- Testing Secret Key as API Key ---');
  try {
    const client = createClient(supabaseUrl, secretKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    const { data, error } = await client
      .from('admins')
      .select('count');
      
    if (error) {
      console.log('❌ Client error:', error);
    } else {
      console.log('✅ Client success:', data);
    }
  } catch (error) {
    console.log('❌ Client exception:', error.message);
  }
}

testSecretKeyAsHeader();
