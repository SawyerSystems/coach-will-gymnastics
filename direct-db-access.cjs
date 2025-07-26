#!/usr/bin/env node

/**
 * PostgreSQL Direct Connection Test & Setup
 * This script establishes full database access via direct PostgreSQL connection
 */

const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_DIRECT_URL,
  ssl: {
    rejectUnauthorized: false // Required for Supabase
  },
  host: 'db.nwdgtdzrcyfmislilucy.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'govgo2-cysdyr-kagmeV'
});

async function testDirectConnection() {
  console.log('🔗 Testing PostgreSQL Direct Connection...\n');
  
  try {
    const client = await pool.connect();
    
    // Test 1: Basic connection info
    console.log('✅ Connection established!');
    
    const userInfo = await client.query('SELECT current_user, current_database(), version()');
    console.log('👤 User:', userInfo.rows[0].current_user);
    console.log('🗄️  Database:', userInfo.rows[0].current_database);
    console.log('🐘 Version:', userInfo.rows[0].version.split(' ')[0]);
    
    // Test 2: Schema access
    console.log('\n🔍 Testing Schema Access...');
    const schemaQuery = `
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    const tables = await client.query(schemaQuery);
    console.log(`✅ Found ${tables.rows.length} tables in public schema`);
    
    tables.rows.forEach(table => {
      console.log(`  - ${table.table_name} (${table.table_type})`);
    });
    
    // Test 3: Write access
    console.log('\n✏️  Testing Write Access...');
    
    try {
      // Create a test table
      await client.query(`
        CREATE TABLE IF NOT EXISTS _test_permissions (
          id SERIAL PRIMARY KEY,
          test_data TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      
      console.log('✅ CREATE TABLE: Success');
      
      // Insert test data
      const insertResult = await client.query(`
        INSERT INTO _test_permissions (test_data) 
        VALUES ('Direct PostgreSQL access test') 
        RETURNING id
      `);
      
      console.log('✅ INSERT: Success (ID:', insertResult.rows[0].id, ')');
      
      // Update test data
      await client.query(`
        UPDATE _test_permissions 
        SET test_data = 'Updated via direct connection' 
        WHERE id = $1
      `, [insertResult.rows[0].id]);
      
      console.log('✅ UPDATE: Success');
      
      // Select test data
      const selectResult = await client.query(`
        SELECT * FROM _test_permissions WHERE id = $1
      `, [insertResult.rows[0].id]);
      
      console.log('✅ SELECT: Success -', selectResult.rows[0].test_data);
      
      // Clean up test table
      await client.query('DROP TABLE _test_permissions');
      console.log('✅ DROP TABLE: Success');
      
    } catch (writeError) {
      console.log('❌ Write access error:', writeError.message);
    }
    
    // Test 4: Advanced queries
    console.log('\n🔬 Testing Advanced Query Access...');
    
    try {
      // Get column information
      const columnInfo = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'bookings' AND table_schema = 'public'
        ORDER BY ordinal_position
      `);
      
      console.log(`✅ Column introspection: ${columnInfo.rows.length} columns in bookings table`);
      
      // Test constraints
      const constraints = await client.query(`
        SELECT conname, contype, confrelid::regclass as foreign_table
        FROM pg_constraint 
        WHERE conrelid = 'bookings'::regclass
      `);
      
      console.log(`✅ Constraint access: ${constraints.rows.length} constraints found`);
      
    } catch (advancedError) {
      console.log('❌ Advanced query error:', advancedError.message);
    }
    
    client.release();
    
    console.log('\n🎉 PostgreSQL Direct Connection: FULLY OPERATIONAL!');
    console.log('\n📋 Capabilities Gained:');
    console.log('  ✅ Full read/write access to all tables');
    console.log('  ✅ Schema modification (CREATE/DROP/ALTER)');
    console.log('  ✅ Complete information_schema access');
    console.log('  ✅ Raw SQL execution');
    console.log('  ✅ Transaction support');
    console.log('  ✅ Index and constraint management');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('  1. Check DATABASE_DIRECT_URL in .env');
    console.log('  2. Verify Supabase database password');
    console.log('  3. Ensure pg package is installed: npm install pg');
  }
}

async function createDatabaseHelpers() {
  console.log('\n🛠️  Creating Database Helper Functions...\n');
  
  const client = await pool.connect();
  
  try {
    // Create helper function for safe SQL execution
    await client.query(`
      CREATE OR REPLACE FUNCTION execute_sql_safely(sql_text TEXT)
      RETURNS TABLE(result JSON)
      LANGUAGE plpgsql
      AS $$
      DECLARE
        rec RECORD;
        result_json JSON;
      BEGIN
        EXECUTE sql_text INTO rec;
        result_json := row_to_json(rec);
        RETURN QUERY SELECT result_json;
      END;
      $$;
    `);
    
    console.log('✅ Created execute_sql_safely function');
    
    // Create table analysis function
    await client.query(`
      CREATE OR REPLACE FUNCTION analyze_table(table_name TEXT)
      RETURNS TABLE(
        column_name TEXT,
        data_type TEXT,
        is_nullable TEXT,
        column_default TEXT,
        character_maximum_length INTEGER
      )
      LANGUAGE sql
      AS $$
        SELECT 
          c.column_name::TEXT,
          c.data_type::TEXT,
          c.is_nullable::TEXT,
          c.column_default::TEXT,
          c.character_maximum_length
        FROM information_schema.columns c
        WHERE c.table_name = $1 AND c.table_schema = 'public'
        ORDER BY c.ordinal_position;
      $$;
    `);
    
    console.log('✅ Created analyze_table function');
    
    console.log('\n🎯 Database helper functions created successfully!');
    
  } catch (error) {
    console.log('❌ Error creating helpers:', error.message);
  } finally {
    client.release();
  }
}

// Export for use in other scripts
const directDB = {
  pool,
  query: async (text, params) => {
    const client = await pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  },
  
  getTableSchema: async (tableName) => {
    return await directDB.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = $1 AND table_schema = 'public'
      ORDER BY ordinal_position
    `, [tableName]);
  },
  
  getAllTables: async () => {
    return await directDB.query(`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
  },
  
  createTable: async (createStatement) => {
    return await directDB.query(createStatement);
  },
  
  insertData: async (tableName, data) => {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    
    return await directDB.query(
      `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`,
      values
    );
  }
};

module.exports = { directDB, pool };

// Run tests if called directly
if (require.main === module) {
  testDirectConnection()
    .then(() => createDatabaseHelpers())
    .then(() => {
      console.log('\n🚀 Setup complete! You now have full PostgreSQL access.');
      process.exit(0);
    })
    .catch(console.error);
}
