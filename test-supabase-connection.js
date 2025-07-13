import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');
  console.log('URL:', process.env.SUPABASE_URL);
  console.log('Service Role Key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  console.log('Service Role Key length:', process.env.SUPABASE_SERVICE_ROLE_KEY?.length);
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('athletes')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.log('❌ Connection test failed:', error);
      return false;
    }

    console.log('✅ Connection successful! Athletes count:', data);
    
    // Try to describe the table structure
    const { data: structure, error: structureError } = await supabase
      .from('athletes')
      .select('*')
      .limit(0);
      
    if (structureError) {
      console.log('❌ Structure query failed:', structureError);
    } else {
      console.log('✅ Table structure accessible');
    }

    return true;

  } catch (error) {
    console.error('❌ Test connection error:', error);
    return false;
  }
}

testConnection()
  .then(success => {
    if (success) {
      console.log('🎉 Connection test passed!');
    } else {
      console.log('❌ Connection test failed');
    }
    process.exit(success ? 0 : 1);
  });
