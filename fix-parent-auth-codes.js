import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://nwdgtdzrcyfmislilucy.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53ZGd0ZHpyY3lmbWlzbGlsdWN5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTQ3MTM4MSwiZXhwIjoyMDUxMDQ3MzgxfQ.d_M8Xa2hXOHZQ2VWQ9KOQqBQDhPBsJJQBxqQP9sHAJY';

// Use service key for admin operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function fixParentAuthCodes() {
  console.log('🔧 Fixing parent_auth_codes table...\n');

  try {
    // 1. First, let's check the current table structure
    console.log('1️⃣ Checking current table structure...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('parent_auth_codes')
      .select('*')
      .limit(1);

    if (tableError) {
      console.log('Table query error:', tableError.message);
    }

    // 2. Try to add the missing column via raw SQL
    console.log('\n2️⃣ Adding missing used_at column...');
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE parent_auth_codes 
        ADD COLUMN IF NOT EXISTS used_at timestamptz;
      `
    }).single();

    if (error) {
      // If RPC doesn't exist, try another approach
      console.log('RPC method not available, trying alternative approach...');
      
      // Create a new auth code with all fields to force column creation
      const { data: testCode, error: createError } = await supabase
        .from('parent_auth_codes')
        .insert({
          parent_id: 23, // Using the existing parent ID
          email: 'swyrwilliam12@gmail.com',
          code: '123456',
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes from now
          used_at: null
        })
        .select()
        .single();

      if (createError && createError.message.includes('used_at')) {
        console.log('⚠️  Column does not exist and cannot be added via API');
        console.log('You may need to add it manually in Supabase dashboard:');
        console.log('ALTER TABLE parent_auth_codes ADD COLUMN used_at timestamptz;');
      } else if (testCode) {
        console.log('✅ Successfully created test auth code with used_at field');
        
        // Clean up the test code
        await supabase
          .from('parent_auth_codes')
          .delete()
          .eq('id', testCode.id);
      }
    } else {
      console.log('✅ Column added successfully');
    }

    // 3. Verify the fix
    console.log('\n3️⃣ Testing auth code creation...');
    const { data: newCode, error: newError } = await supabase
      .from('parent_auth_codes')
      .insert({
        parent_id: 23,
        email: 'swyrwilliam12@gmail.com',
        code: '654321',
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString()
      })
      .select()
      .single();

    if (newError) {
      console.error('❌ Error creating auth code:', newError.message);
    } else {
      console.log('✅ Auth code created successfully:', newCode);
      
      // Clean up
      await supabase
        .from('parent_auth_codes')
        .delete()
        .eq('id', newCode.id);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }

  console.log('\n✅ Fix attempt completed!');
}

// Run the fix
fixParentAuthCodes();