#!/usr/bin/env node

console.log('🧪 Testing basic connection...');

try {
  const { createClient } = require('@supabase/supabase-js');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Missing environment variables');
    console.log('SUPABASE_URL:', !!supabaseUrl);
    console.log('SUPABASE_ANON_KEY:', !!supabaseKey);
    process.exit(1);
  }
  
  console.log('✅ Environment variables found');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  async function testQuery() {
    const { data, error } = await supabase
      .from('bookings')
      .select('id, athlete1_name, athlete2_name, preferred_date, status, payment_status')
      .limit(5);
      
    if (error) {
      console.error('❌ Query error:', error);
      return;
    }
    
    console.log('✅ Sample bookings:', data);
  }
  
  testQuery();
  
} catch (error) {
  console.error('❌ Script error:', error);
}
