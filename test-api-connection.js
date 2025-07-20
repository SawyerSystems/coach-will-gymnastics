// Simple migration via API endpoint
const express = require('express');
const dotenv = require('dotenv');

// Create a simple endpoint to run the migration via the existing server
async function testDirectAPIConnection() {
  try {
    console.log('Testing direct API connection...');
    
    // Use fetch to call our own server's API
    const response = await fetch('http://localhost:5001/api/bookings');
    const result = await response.text();
    
    console.log('API Response length:', result.length);
    console.log('First 500 chars:', result.substring(0, 500));
    
  } catch (error) {
    console.error('API test failed:', error.message);
  }
}

testDirectAPIConnection();
