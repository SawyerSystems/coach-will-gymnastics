/**
 * Database Schema Introspection Script
 * Examines current Supabase database structure and compares with expected schema
 */

async function introspectDatabase() {
  console.log('🔍 SUPABASE DATABASE SCHEMA INTROSPECTION\n');
  
  try {
    // Get admin session first
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@coachwilltumbles.com',
        password: 'TumbleCoach2025!'
      })
    });
    
    const cookies = loginResponse.headers.get('set-cookie');
    
    // Test each normalization table
    console.log('=== TESTING API ENDPOINTS ===');
    
    const endpoints = ['apparatus', 'focus-areas', 'side-quests'];
    
    for (const endpoint of endpoints) {
      console.log(`\n--- Testing /api/${endpoint} ---`);
      
      // Test GET
      const getResponse = await fetch(`http://localhost:5000/api/${endpoint}`, {
        headers: { 'Cookie': cookies }
      });
      console.log(`GET /api/${endpoint}: ${getResponse.status}`);
      
      const data = await getResponse.json();
      console.log(`Response: ${JSON.stringify(data, null, 2)}`);
      
      // Test POST with minimal data
      const testName = `Test${endpoint.replace('-', '')}${Date.now()}`;
      const postResponse = await fetch(`http://localhost:5000/api/${endpoint}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cookie': cookies 
        },
        body: JSON.stringify({ name: testName })
      });
      
      console.log(`POST /api/${endpoint}: ${postResponse.status}`);
      const postData = await postResponse.json();
      console.log(`POST Response: ${JSON.stringify(postData, null, 2)}`);
    }
    
  } catch (error) {
    console.error('❌ Introspection failed:', error);
  }
}

introspectDatabase();