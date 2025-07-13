/**
 * Run the database normalization migration via API
 * This script creates the normalized lookup tables and populates them with data
 */

const fs = require('fs');
const path = require('path');

// Read and execute the SQL migration
async function runNormalizationMigration() {
  try {
    console.log('🚀 Starting database normalization migration...');
    
    // Read the SQL migration file
    const migrationSQL = fs.readFileSync(path.join(__dirname, 'create-normalization-migration.sql'), 'utf8');
    
    // Split into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📋 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\n⏳ Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        const response = await fetch('http://localhost:5000/api/execute-sql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sql: statement
          })
        });
        
        if (!response.ok) {
          const error = await response.text();
          console.error(`❌ Statement ${i + 1} failed:`, error);
          continue;
        }
        
        const result = await response.json();
        console.log(`✅ Statement ${i + 1} completed successfully`);
        
        if (result.rows && result.rows.length > 0) {
          console.log(`   → Affected ${result.rows.length} rows`);
        }
        
      } catch (error) {
        console.error(`❌ Statement ${i + 1} failed:`, error.message);
      }
    }
    
    console.log('\n🎉 Database normalization migration completed!');
    
    // Verify the migration
    console.log('\n🔍 Verifying migration results...');
    await verifyMigration();
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

async function verifyMigration() {
  try {
    // Check if tables exist and count records
    const checks = [
      { table: 'apparatus', expected: 10 },
      { table: 'focus_areas', expected: 39 },
      { table: 'side_quests', expected: 10 }
    ];
    
    for (const check of checks) {
      const response = await fetch(`http://localhost:5000/api/${check.table}`);
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${check.table}: ${data.length} records (expected: ${check.expected})`);
      } else {
        console.log(`❌ ${check.table}: API endpoint not working`);
      }
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

// Run the migration
runNormalizationMigration();