#!/usr/bin/env node

/**
 * Quick test to verify the 50MB upload limit fix
 */

import fetch from 'node-fetch';
import fs from 'fs';
import FormData from 'form-data';

const SERVER_URL = 'http://localhost:5001';

// Admin login and get session cookie
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
    
    console.log(`🧪 Testing ${sizeInMB}MB upload...`);
    
    const response = await fetch(`${SERVER_URL}/api/admin/media?context=athlete-skill`, {
      method: 'POST',
      body: form,
      headers: {
        'Cookie': sessionCookie,
        ...form.getHeaders()
      }
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log(`✅ ${sizeInMB}MB: SUCCESS - ${result.url}`);
      return true;
    } else {
      const error = await response.text();
      console.log(`❌ ${sizeInMB}MB: FAILED - ${error}`);
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
    console.log('🔑 Getting admin session...');
    const sessionCookie = await getAdminSession();
    if (!sessionCookie) {
      throw new Error('Failed to get session cookie');
    }
    console.log('✅ Session obtained');
    
    console.log('\n🎯 Testing upload limits after fix...');
    
    const testSizes = [45, 50, 55, 60, 75, 80]; // Test around the 50MB mark
    
    for (const size of testSizes) {
      await testUpload(sessionCookie, size);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n🎉 Test complete! Files should work up to ~50MB.');
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

main();
