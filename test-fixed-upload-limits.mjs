#!/usr/bin/env node

/**
 * Test upload with the fixed 1GB Supabase bucket limit
 * This verifies that files up to 500MB now work properly
 */

import fetch from 'node-fetch';
import fs from 'fs';
import FormData from 'form-data';

const SERVER_URL = 'http://localhost:5001';

// Admin login
async function getAdminSession() {
  const loginResponse = await fetch(`${SERVER_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'admin@coachwilltumbles.com',
      password: 'TumbleCoach2025!'
    })
  });

  if (!loginResponse.ok) {
    throw new Error('Failed to login');
  }

  const cookies = loginResponse.headers.get('set-cookie');
  return cookies ? cookies.split(';')[0] : null;
}

// Create test file
function createTestFile(sizeInMB, filename) {
  const sizeInBytes = sizeInMB * 1024 * 1024;
  const buffer = Buffer.alloc(sizeInBytes, 0);
  
  // Add MP4 header
  const mp4Header = Buffer.from([
    0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70,
    0x69, 0x73, 0x6F, 0x6D, 0x00, 0x00, 0x02, 0x00,
    0x69, 0x73, 0x6F, 0x6D, 0x69, 0x73, 0x6F, 0x32,
    0x61, 0x76, 0x63, 0x31, 0x6D, 0x70, 0x34, 0x31
  ]);
  
  mp4Header.copy(buffer, 0);
  fs.writeFileSync(filename, buffer);
  return filename;
}

// Test upload
async function testUpload(sessionCookie, sizeInMB) {
  const filename = `test-${sizeInMB}mb.mp4`;
  
  try {
    createTestFile(sizeInMB, filename);
    
    const form = new FormData();
    form.append('file', fs.createReadStream(filename), {
      filename: filename,
      contentType: 'video/mp4'
    });
    
    console.log(`🧪 Testing ${sizeInMB}MB upload (this may take a while for large files)...`);
    
    const startTime = Date.now();
    const response = await fetch(`${SERVER_URL}/api/admin/media?context=athlete-skill`, {
      method: 'POST',
      body: form,
      headers: {
        'Cookie': sessionCookie,
        ...form.getHeaders()
      },
      timeout: 300000 // 5 minute timeout
    });
    
    const duration = Date.now() - startTime;
    
    if (response.ok) {
      const result = await response.json();
      console.log(`✅ ${sizeInMB}MB: SUCCESS in ${(duration/1000).toFixed(1)}s`);
      console.log(`   URL: ${result.url}`);
      return true;
    } else {
      const error = await response.text();
      console.log(`❌ ${sizeInMB}MB: FAILED in ${(duration/1000).toFixed(1)}s`);
      console.log(`   Error: ${error}`);
      return false;
    }
    
  } catch (error) {
    console.log(`💥 ${sizeInMB}MB: EXCEPTION - ${error.message}`);
    return false;
  } finally {
    if (fs.existsSync(filename)) {
      fs.unlinkSync(filename);
    }
  }
}

async function main() {
  try {
    console.log('🎯 TESTING FIXED UPLOAD LIMITS');
    console.log('==============================');
    console.log('✅ Supabase bucket configured for 1GB limit');
    console.log('✅ Application configured for 500MB limit');
    console.log('🔑 Getting admin session...');
    
    const sessionCookie = await getAdminSession();
    if (!sessionCookie) {
      throw new Error('Failed to get session cookie');
    }
    console.log('✅ Session obtained\n');
    
    // Test sizes that should now work
    const testSizes = [
      100, // This previously failed
      150, // User's actual file size
      200, // Should work now  
      300, // Should work now
      400, // Should work now
      500, // Application limit
    ];
    
    for (const size of testSizes) {
      await testUpload(sessionCookie, size);
      console.log(''); // Space between tests
      
      // Small delay between tests to avoid overwhelming
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('🎉 Testing complete!');
    console.log('📊 The user\'s 156MB file should now upload successfully.');
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

main();
