import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = 'https://nwdgtdzrcyfmislilucy.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create service role client
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`
    }
  }
});

async function testServiceRole() {
  try {
    console.log('🔍 Testing service role permissions...');
    
    // Test 1: Check current role
    const { data: roleData, error: roleError } = await supabaseAdmin
      .rpc('auth.role');
    
    console.log('Current role:', roleData, 'Error:', roleError);
    
    // Test 2: Try to insert directly with service role
    const testParent = {
      first_name: 'Service',
      last_name: 'Test',
      email: 'service-test@example.com',
      phone: '555-9999',
      emergency_contact_name: 'Service Emergency',
      emergency_contact_phone: '555-9998'
    };
    
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('parents')
      .insert(testParent)
      .select()
      .single();
    
    console.log('Insert result:', insertData);
    console.log('Insert error:', insertError);
    
    if (insertData) {
      // Clean up - delete the test parent
      await supabaseAdmin
        .from('parents')
        .delete()
        .eq('id', insertData.id);
      console.log('✅ Test parent cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testServiceRole();
