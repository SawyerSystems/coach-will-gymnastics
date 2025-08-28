#!/usr/bin/env node

/**
 * Check and fix Supabase bucket file size limits
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nwdgtdzrcyfmislilucy.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

if (!serviceRoleKey) {
  console.error('❌ No service role key found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkBucketConfig() {
  try {
    console.log('🔍 Checking current bucket configuration...');
    
    // Query the buckets table directly
    const { data, error } = await supabase
      .from('storage.buckets')
      .select('*')
      .eq('id', 'site-media');

    if (error) {
      console.error('❌ Error querying buckets:', error);
      return;
    }

    if (!data || data.length === 0) {
      console.log('❌ No site-media bucket found');
      return;
    }

    const bucket = data[0];
    console.log('📊 Current bucket configuration:');
    console.log(JSON.stringify(bucket, null, 2));
    
    // Check file size limit
    if (bucket.file_size_limit) {
      const limitMB = Math.round(bucket.file_size_limit / (1024 * 1024));
      console.log(`📏 Current file size limit: ${limitMB}MB (${bucket.file_size_limit} bytes)`);
      
      if (limitMB < 500) {
        console.log('⚠️  Bucket file size limit is too low!');
        await updateBucketLimit();
      } else {
        console.log('✅ Bucket file size limit looks good');
      }
    } else {
      console.log('ℹ️  No file size limit set (should default to 10GB)');
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

async function updateBucketLimit() {
  try {
    console.log('\n🔧 Attempting to update bucket file size limit...');
    
    // Update to 1GB (1,073,741,824 bytes) - reasonable for video files
    const newLimit = 1 * 1024 * 1024 * 1024; // 1GB
    
    const { data, error } = await supabase
      .from('storage.buckets')
      .update({ file_size_limit: newLimit })
      .eq('id', 'site-media')
      .select();

    if (error) {
      console.error('❌ Error updating bucket:', error);
      
      // Try via RPC if direct update fails
      console.log('🔄 Trying alternative method...');
      
      const { data: rpcData, error: rpcError } = await supabase.rpc('exec_sql', {
        query: `UPDATE storage.buckets SET file_size_limit = ${newLimit} WHERE id = 'site-media'`
      });
      
      if (rpcError) {
        console.error('❌ RPC method also failed:', rpcError);
        console.log('\n📝 Manual SQL to run in Supabase SQL editor:');
        console.log(`UPDATE storage.buckets SET file_size_limit = ${newLimit} WHERE id = 'site-media';`);
        console.log(`-- This sets the limit to ${Math.round(newLimit / (1024 * 1024 * 1024))}GB`);
      } else {
        console.log('✅ Updated via RPC method');
      }
    } else {
      console.log('✅ Bucket limit updated successfully!');
      console.log('📊 New configuration:', data);
    }

  } catch (error) {
    console.error('💥 Update failed:', error);
  }
}

async function main() {
  console.log('🎯 SUPABASE BUCKET CONFIGURATION CHECK');
  console.log('=====================================');
  console.log(`🔗 Project URL: ${supabaseUrl}`);
  console.log(`🔑 Using service role key: ${serviceRoleKey.substring(0, 20)}...`);
  
  await checkBucketConfig();
  
  console.log('\n✅ Investigation complete!');
}

main();
