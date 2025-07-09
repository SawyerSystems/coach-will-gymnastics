#!/usr/bin/env node

// Development server starter script
// This script compiles TypeScript and runs the development server

const { spawn } = require('child_process');
const { existsSync } = require('fs');
const path = require('path');

// Set development environment
process.env.NODE_ENV = 'development';

console.log('Starting development server...');

// Check if tsx exists in node_modules
const tsxPath = path.join(__dirname, 'node_modules', '.bin', 'tsx');
const serverPath = path.join(__dirname, 'server', 'index.ts');

if (existsSync(tsxPath)) {
  console.log('Using tsx from node_modules');
  const server = spawn(tsxPath, [serverPath], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' }
  });

  server.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
    process.exit(code);
  });
} else {
  console.log('tsx not found in node_modules, using npx');
  const server = spawn('npx', ['tsx', serverPath], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' }
  });

  server.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
    process.exit(code);
  });
}