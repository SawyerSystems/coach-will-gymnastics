#!/usr/bin/env node

/**
 * Test large video upload to identify 400MB limit issues
 * This script tests the video upload pipeline to identify where large files fail
 */

import fetch from 'node-fetch';
import fs from 'fs';
import FormData from 'form-data';

// Test configuration
const SERVER_URL = 'http://localhost:5001';
const ADMIN_SESSION_COOKIE = 'cwt.sid.dev=s%3AwtZNu4UHvu4D9j9m0WMhck0SmlrNdLfr.HieRHqOqSU8KjilPPdT5oS%2FZLpfgo%2FpMNhymY6X8tco'; // Fresh admin session

/**
 * Create a test file of specified size (in MB)
 */
function createTestFile(sizeInMB, filename) {
  const sizeInBytes = sizeInMB * 1024 * 1024;
  const buffer = Buffer.alloc(sizeInBytes, 0);
  
  // Add some basic MP4-like headers to make it appear as a video file
  const mp4Header = Buffer.from([
    0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, // ftyp box
    0x69, 0x73, 0x6F, 0x6D, 0x00, 0x00, 0x02, 0x00, // isom brand
    0x69, 0x73, 0x6F, 0x6D, 0x69, 0x73, 0x6F, 0x32, // compatible brands
    0x61, 0x76, 0x63, 0x31, 0x6D, 0x70, 0x34, 0x31  // more brands
  ]);
  
  mp4Header.copy(buffer, 0);
  fs.writeFileSync(filename, buffer);
  console.log(`✅ Created test file: ${filename} (${sizeInMB}MB)`);
  return filename;
}

/**
 * Test upload with specific file size
 */
async function testUpload(sizeInMB, endpoint = '/api/admin/media') {
  const filename = `test-video-${sizeInMB}mb.mp4`;
  
  try {
    console.log(`\n🧪 Testing ${sizeInMB}MB video upload...`);
    
    // Create test file
    createTestFile(sizeInMB, filename);
    
    // Prepare form data
    const form = new FormData();
    form.append('file', fs.createReadStream(filename), {
      filename: filename,
      contentType: 'video/mp4'
    });
    
    // Optional context for athlete videos
    const url = endpoint + (endpoint.includes('admin/media') ? '?context=athlete-skill' : '');
    
    console.log(`📤 Uploading to: ${SERVER_URL}${url}`);
    console.log(`📁 File size: ${sizeInMB}MB`);
    console.log(`🍪 Using admin session for authentication`);
    
    const startTime = Date.now();
    
    const response = await fetch(`${SERVER_URL}${url}`, {
      method: 'POST',
      body: form,
      headers: {
        'Cookie': ADMIN_SESSION_COOKIE,
        ...form.getHeaders()
      },
      timeout: 300000 // 5 minute timeout
    });
    
    const duration = Date.now() - startTime;
    console.log(`⏱️  Upload took: ${duration}ms (${(duration / 1000).toFixed(1)}s)`);
    
    if (response.ok) {
      const result = await response.json();
      console.log(`✅ SUCCESS: Upload completed`);
      console.log(`🔗 URL: ${result.url}`);
      console.log(`📊 Response:`, {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        result
      });
      return { success: true, result, duration };
    } else {
      const errorText = await response.text();
      console.log(`❌ FAILED: Upload failed`);
      console.log(`📊 Response:`, {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: errorText
      });
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { rawError: errorText };
      }
      
      return { success: false, error: errorData, status: response.status, duration };
    }
    
  } catch (error) {
    console.log(`💥 EXCEPTION: ${error.message}`);
    if (error.code) {
      console.log(`🔧 Error code: ${error.code}`);
    }
    if (error.type) {
      console.log(`🔧 Error type: ${error.type}`);
    }
    return { success: false, exception: error.message, errorCode: error.code };
  } finally {
    // Cleanup test file
    try {
      if (fs.existsSync(filename)) {
        fs.unlinkSync(filename);
        console.log(`🧹 Cleaned up test file: ${filename}`);
      }
    } catch (e) {
      console.log(`⚠️  Could not clean up test file: ${e.message}`);
    }
  }
}

/**
 * Test different file sizes to find the breaking point
 */
async function runFileSeizeTests() {
  console.log('🎯 LARGE VIDEO UPLOAD INVESTIGATION');
  console.log('=====================================');
  
  const testSizes = [
    1,    // 1MB - should work
    10,   // 10MB - should work
    50,   // 50MB - should work
    100,  // 100MB - should work
    200,  // 200MB - should work
    300,  // 300MB - should work
    400,  // 400MB - this is where user reports issues
    450,  // 450MB - slightly over 400MB
    500,  // 500MB - Supabase limit
    600   // 600MB - over Supabase limit
  ];
  
  const results = [];
  
  for (const size of testSizes) {
    const result = await testUpload(size);
    results.push({ size, ...result });
    
    // Stop if we hit a hard failure
    if (!result.success && (result.status === 413 || result.exception)) {
      console.log(`\n🛑 Stopping tests at ${size}MB due to hard failure`);
      break;
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log('\n📊 TEST RESULTS SUMMARY');
  console.log('========================');
  
  results.forEach(({ size, success, duration, status, error, exception }) => {
    const icon = success ? '✅' : '❌';
    const time = duration ? `${(duration / 1000).toFixed(1)}s` : 'N/A';
    const details = success 
      ? `(${time})` 
      : error?.error || exception || `HTTP ${status}`;
    
    console.log(`${icon} ${size}MB: ${details}`);
  });
  
  // Find breaking point
  const lastSuccess = results.filter(r => r.success).pop();
  const firstFailure = results.find(r => !r.success);
  
  if (lastSuccess && firstFailure) {
    console.log(`\n🎯 BREAKING POINT IDENTIFIED:`);
    console.log(`   Last successful upload: ${lastSuccess.size}MB`);
    console.log(`   First failed upload: ${firstFailure.size}MB`);
    console.log(`   Upload limit appears to be between ${lastSuccess.size}MB and ${firstFailure.size}MB`);
  }
}

/**
 * Test system limits and configuration
 */
async function testSystemLimits() {
  console.log('\n🔧 SYSTEM CONFIGURATION CHECK');
  console.log('===============================');
  
  // Test Express body parser limits
  console.log('\n📝 Express Configuration:');
  console.log('  - JSON limit: 5MB (dev) / 10MB (prod)');
  console.log('  - URL-encoded limit: 5MB (dev) / 10MB (prod)');
  console.log('  - Multer limit: 500MB');
  
  // Test Supabase limits
  console.log('\n☁️  Supabase Configuration:');
  console.log('  - Storage bucket limit: 500MB (per file)');
  console.log('  - Service role timeout: 120s');
  
  // Test server timeouts
  console.log('\n⏱️  Server Timeouts:');
  console.log('  - keepAliveTimeout: 120s');
  console.log('  - headersTimeout: 120s');
}

/**
 * Run the investigation
 */
async function main() {
  try {
    await testSystemLimits();
    await runFileSeizeTests();
    
    console.log('\n🎉 Investigation complete!');
    console.log('Check the results above to identify the exact upload limit.');
    
  } catch (error) {
    console.error('💥 Investigation failed:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
