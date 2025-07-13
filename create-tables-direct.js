/**
 * Direct table creation using Supabase REST API
 * Since exec_sql doesn't exist, we'll use individual table creation
 */

async function createNormalizationTables() {
  try {
    console.log('🚀 Creating normalization tables directly...');
    
    // First, let's test if the apparatus endpoint works
    console.log('Testing existing apparatus endpoint...');
    try {
      const response = await fetch('http://localhost:5000/api/apparatus');
      const text = await response.text();
      console.log('Response status:', response.status);
      console.log('Response preview:', text.substring(0, 200));
      
      if (!response.ok || text.includes('<!DOCTYPE html>')) {
        console.log('❌ Apparatus endpoint is not working - tables likely don\'t exist');
      } else {
        console.log('✅ Apparatus endpoint is working');
        const data = JSON.parse(text);
        console.log('Apparatus count:', data.length);
      }
    } catch (error) {
      console.error('Error testing apparatus endpoint:', error.message);
    }
    
    // Test other endpoints
    const endpoints = ['focus-areas', 'side-quests'];
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`http://localhost:5000/api/${endpoint}`);
        const text = await response.text();
        console.log(`${endpoint} status:`, response.status);
        
        if (response.ok && !text.includes('<!DOCTYPE html>')) {
          const data = JSON.parse(text);
          console.log(`${endpoint} count:`, data.length);
        } else {
          console.log(`❌ ${endpoint} endpoint not working`);
        }
      } catch (error) {
        console.error(`Error testing ${endpoint}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createNormalizationTables();