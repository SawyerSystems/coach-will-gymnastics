#!/usr/bin/env node
/**
 * Migration script to replace customer terminology with parent terminology
 */

import fs from 'fs';
import path from 'path';

const REPLACEMENTS = [
  // Variable names
  { from: /customerData/g, to: 'parentData' },
  { from: /customerBookings/g, to: 'parentBookings' },
  { from: /prefilledCustomer/g, to: 'prefilledParent' },
  { from: /isReturningCustomer/g, to: 'isReturningParent' },
  { from: /isNewCustomer/g, to: 'isNewParent' },
  { from: /showCustomerModal/g, to: 'showParentModal' },
  { from: /setCustomerData/g, to: 'setParentData' },
  { from: /handleCustomerConfirmed/g, to: 'handleParentConfirmed' },
  
  // API references
  { from: /identify-customer/g, to: 'identify-parent' },
  { from: /\/api\/customers/g, to: '/api/parents' },
  { from: /createCustomer/g, to: 'createParent' },
  
  // Type references
  { from: /Customer/g, to: 'Parent' },
  
  // Comments and strings
  { from: /customer/g, to: 'parent' },
  { from: /Customer identification/g, to: 'Parent identification' },
  { from: /Customer management/g, to: 'Parent management' },
  { from: /customers data/g, to: 'parents data' },
  { from: /identifying customer/g, to: 'identifying parent' },
  { from: /identify customer/g, to: 'identify parent' },
  { from: /creating customer/g, to: 'creating parent' },
  
  // Component references
  { from: /CustomerIdentificationEnhanced/g, to: 'ParentIdentificationEnhanced' },
  { from: /customer-identification-enhanced/g, to: 'parent-identification-enhanced' }
];

function replaceInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    REPLACEMENTS.forEach(({ from, to }) => {
      const newContent = content.replace(from, to);
      if (newContent !== content) {
        content = newContent;
        changed = true;
      }
    });
    
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
  }
}

function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules, .git, and other system directories
      if (!entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== 'dist') {
        processDirectory(fullPath);
      }
    } else if (entry.isFile()) {
      // Process TypeScript, JavaScript, and TSX files
      if (entry.name.match(/\.(ts|tsx|js|jsx)$/)) {
        replaceInFile(fullPath);
      }
    }
  }
}

// Process server and client directories
const serverDir = path.join(process.cwd(), 'server');
const clientDir = path.join(process.cwd(), 'client');

console.log('🔄 Starting customer-to-parent terminology migration...');

if (fs.existsSync(serverDir)) {
  console.log('\n📁 Processing server directory...');
  processDirectory(serverDir);
}

if (fs.existsSync(clientDir)) {
  console.log('\n📁 Processing client directory...');
  processDirectory(clientDir);
}

console.log('\n🎉 Migration completed!');
