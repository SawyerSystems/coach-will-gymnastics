#!/usr/bin/env node

/**
 * Simple SQL Executor using environment variables
 * Usage: node run-sql-env.cjs "SQL COMMAND" or node run-sql-env.cjs filename.sql
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

async function executeSQL(sqlQuery) {
  // Use environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
  });

  try {
    console.log('🔍 Executing SQL:');
    console.log('─'.repeat(50));
    console.log(sqlQuery);
    console.log('─'.repeat(50));

    // Try different methods to execute SQL
    console.log('Attempting direct SQL execution...');
    
    // Method 1: Try to use SQL endpoint directly
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({ query: sqlQuery })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ SQL executed successfully:', result);
      return true;
    } else {
      console.log('Method 1 failed, trying method 2...');
      
      // Method 2: Try manual table access for simple queries
      if (sqlQuery.trim().toUpperCase().startsWith('SELECT')) {
        console.log('⚠️  This is a SELECT query. For view creation, you need to run this manually in Supabase SQL editor.');
        console.log('📋 Copy this SQL to Supabase SQL editor:');
        console.log(sqlQuery);
        return false;
      } else {
        console.log('⚠️  This is a DDL query. You need to run this manually in Supabase SQL editor.');
        console.log('📋 Copy this SQL to Supabase SQL editor:');
        console.log(sqlQuery);
        return false;
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('📋 Please run this SQL manually in Supabase SQL editor:');
    console.log(sqlQuery);
    return false;
  }
}

// Main execution
const sqlArg = process.argv[2];
if (!sqlArg) {
  console.error('Usage: node Tests/cjs/run-sql-env.cjs "SQL COMMAND" or node Tests/cjs/run-sql-env.cjs Tests/sql/filename.sql');
  process.exit(1);
}

let sqlToRun;
if (fs.existsSync(sqlArg)) {
  sqlToRun = fs.readFileSync(sqlArg, 'utf8');
  console.log(`📄 Reading SQL from file: ${sqlArg}`);
} else {
  sqlToRun = sqlArg;
}

executeSQL(sqlToRun).then(success => {
  if (success) {
    console.log('✅ SQL execution completed successfully');
  } else {
    console.log('⚠️  Manual execution required - see instructions above');
  }
});
