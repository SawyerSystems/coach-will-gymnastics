#!/usr/bin/env node

/**
 * SQL Execution Script for Supabase Database
 * Usage: node run-sql.js "SELECT * FROM bookings LIMIT 5;"
 * Usage: node run-sql.js --file migration.sql
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Direct PostgreSQL connection string with IPv4 only
const connectionString = 'postgresql://postgres:govgo2-cysdyr-kagmeV@db.nwdgtdzrcyfmislilucy.supabase.co:5432/postgres';

async function runSQL(sqlQuery) {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    // Force IPv4
    options: '--ip-version=4'
  });

  try {
    console.log('🔌 Connecting to Supabase database...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    console.log('📝 Executing SQL:');
    console.log('─'.repeat(50));
    console.log(sqlQuery);
    console.log('─'.repeat(50));

    const startTime = Date.now();
    const result = await client.query(sqlQuery);
    const endTime = Date.now();

    console.log(`\n⚡ Executed in ${endTime - startTime}ms`);
    
    if (result.command === 'SELECT' && result.rows.length > 0) {
      console.log(`📊 Results (${result.rows.length} rows):`);
      console.table(result.rows);
    } else if (result.command === 'INSERT' || result.command === 'UPDATE' || result.command === 'DELETE') {
      console.log(`✅ ${result.command} completed successfully. Rows affected: ${result.rowCount}`);
    } else if (result.command === 'CREATE' || result.command === 'ALTER' || result.command === 'DROP') {
      console.log(`✅ ${result.command} completed successfully.`);
    } else {
      console.log('✅ Query executed successfully.');
      if (result.rows && result.rows.length > 0) {
        console.table(result.rows);
      }
    }

  } catch (error) {
    console.error('❌ Error executing SQL:');
    console.error(error.message);
    if (error.detail) {
      console.error('Detail:', error.detail);
    }
    if (error.hint) {
      console.error('Hint:', error.hint);
    }
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Connection closed.');
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage:');
    console.log('  node run-sql.js "SELECT * FROM bookings LIMIT 5;"');
    console.log('  node run-sql.js --file migration.sql');
    process.exit(1);
  }

  let sqlQuery;

  if (args[0] === '--file' && args[1]) {
    const filePath = path.resolve(args[1]);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      process.exit(1);
    }
    sqlQuery = fs.readFileSync(filePath, 'utf8');
    console.log(`📁 Reading SQL from file: ${filePath}`);
  } else {
    sqlQuery = args.join(' ');
  }

  if (!sqlQuery.trim()) {
    console.error('❌ No SQL query provided');
    process.exit(1);
  }

  await runSQL(sqlQuery);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runSQL };
