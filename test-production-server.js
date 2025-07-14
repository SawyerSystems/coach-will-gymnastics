#!/usr/bin/env node

import { spawn } from 'child_process';
import { createRequire } from 'module';
import { readFileSync } from 'fs';
import { join } from 'path';

const require = createRequire(import.meta.url);

console.log('Testing Production Server...\n');

// Set production environment
process.env.NODE_ENV = 'production';

// Load environment variables
try {
  const envContent = readFileSync('.env', 'utf8');
  const envVars = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  envVars.forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
  console.log('✓ Environment variables loaded from .env');
} catch (error) {
  console.log('⚠ Could not load .env file:', error.message);
}

// Start the server
const server = spawn('node', ['dist/index.js'], {
  stdio: 'pipe',
  env: { ...process.env, NODE_ENV: 'production' }
});

let serverStarted = false;
let output = '';

server.stdout.on('data', (data) => {
  const text = data.toString();
  output += text;
  console.log(text.trim());
  
  if (text.includes('serving on port') && !serverStarted) {
    serverStarted = true;
    testEndpoints();
  }
});

server.stderr.on('data', (data) => {
  console.error('Server Error:', data.toString());
});

server.on('close', (code) => {
  console.log(`\nServer process exited with code ${code}`);
  process.exit(code);
});

// Test endpoints after server starts
function testEndpoints() {
  setTimeout(async () => {
    console.log('\n--- Testing Endpoints ---');
    
    const tests = [
      { url: 'http://localhost:5001/', description: 'Home page' },
      { url: 'http://localhost:5001/assets/index-B_1bMA43.js', description: 'Main JS bundle' },
      { url: 'http://localhost:5001/assets/index-YCoIXNtD.css', description: 'Main CSS bundle' },
      { url: 'http://localhost:5001/api/site-content', description: 'Site content API' }
    ];
    
    for (const test of tests) {
      try {
        const response = await fetch(test.url);
        const contentType = response.headers.get('content-type') || 'unknown';
        
        console.log(`${test.description}:`);
        console.log(`  Status: ${response.status}`);
        console.log(`  Content-Type: ${contentType}`);
        
        if (test.url.includes('.js') && !contentType.includes('application/javascript')) {
          console.log(`  ⚠ MIME type issue: Expected application/javascript, got ${contentType}`);
        } else if (test.url.includes('.css') && !contentType.includes('text/css')) {
          console.log(`  ⚠ MIME type issue: Expected text/css, got ${contentType}`);
        } else if (test.url.endsWith('/') && !contentType.includes('text/html')) {
          console.log(`  ⚠ MIME type issue: Expected text/html, got ${contentType}`);
        } else {
          console.log(`  ✓ Correct MIME type`);
        }
        
        console.log('');
      } catch (error) {
        console.log(`${test.description}: ❌ Error - ${error.message}\n`);
      }
    }
    
    console.log('--- Tests Complete ---');
    console.log('\nPress Ctrl+C to stop the server');
  }, 2000);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.kill('SIGTERM');
});
