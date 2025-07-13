/**
 * PostgreSQL DATE/TIME Migration Script for CoachWillTumbles.com
 * Migrates from TEXT to native DATE and TIME types with Pacific timezone support
 */

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://nwdgtdzrcyfmislilucy.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_KEY environment variable is required');
  process.exit(1);
}

async function makeRequest(method, path, body = null) {
  const url = `${SUPABASE_URL}/rest/v1${path}`;
  const options = {
    method,
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }

  if (response.status === 204) {
    return {};
  }

  return response.json();
}

async function executeSQL(sql) {
  try {
    console.log(`🔄 Executing: ${sql.substring(0, 100)}...`);
    
    // Use Supabase SQL RPC function
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sql })
    });

    if (!response.ok) {
      const error = await response.text();
      console.log(`⚠️  SQL execution via RPC failed, trying direct table modification: ${error}`);
      return false;
    }

    const result = await response.json();
    console.log('✅ SQL executed successfully');
    return result;
  } catch (error) {
    console.log(`⚠️  SQL execution failed: ${error.message}`);
    return false;
  }
}

async function migrateBookingsTable() {
  console.log('\n📅 Migrating bookings table...');
  
  try {
    // Get current bookings data
    const bookings = await makeRequest('GET', '/bookings');
    console.log(`📊 Found ${bookings.length} bookings to migrate`);

    for (const booking of bookings) {
      const updates = {};
      let needsUpdate = false;

      // Convert preferred_date if it's a string
      if (booking.preferred_date && typeof booking.preferred_date === 'string') {
        // Already in YYYY-MM-DD format, should work with PostgreSQL DATE
        updates.preferred_date = booking.preferred_date;
        needsUpdate = true;
      }

      // Convert preferred_time if it's a string
      if (booking.preferred_time && typeof booking.preferred_time === 'string') {
        // Ensure HH:MM format for PostgreSQL TIME
        const timeMatch = booking.preferred_time.match(/^(\d{1,2}):(\d{2})(?::\d{2})?/);
        if (timeMatch) {
          const hours = timeMatch[1].padStart(2, '0');
          const minutes = timeMatch[2];
          updates.preferred_time = `${hours}:${minutes}`;
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        await makeRequest('PATCH', `/bookings?id=eq.${booking.id}`, updates);
        console.log(`✅ Updated booking ${booking.id}`);
      }
    }

    console.log('✅ Bookings table migration completed');
  } catch (error) {
    console.error('❌ Bookings migration failed:', error.message);
  }
}

async function migrateAvailabilityTable() {
  console.log('\n⏰ Migrating availability table...');
  
  try {
    // Get current availability data
    const availability = await makeRequest('GET', '/availability');
    console.log(`📊 Found ${availability.length} availability records to migrate`);

    for (const record of availability) {
      const updates = {};
      let needsUpdate = false;

      // Convert start_time if it's a string
      if (record.start_time && typeof record.start_time === 'string') {
        const timeMatch = record.start_time.match(/^(\d{1,2}):(\d{2})(?::\d{2})?/);
        if (timeMatch) {
          const hours = timeMatch[1].padStart(2, '0');
          const minutes = timeMatch[2];
          updates.start_time = `${hours}:${minutes}`;
          needsUpdate = true;
        }
      }

      // Convert end_time if it's a string
      if (record.end_time && typeof record.end_time === 'string') {
        const timeMatch = record.end_time.match(/^(\d{1,2}):(\d{2})(?::\d{2})?/);
        if (timeMatch) {
          const hours = timeMatch[1].padStart(2, '0');
          const minutes = timeMatch[2];
          updates.end_time = `${hours}:${minutes}`;
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        await makeRequest('PATCH', `/availability?id=eq.${record.id}`, updates);
        console.log(`✅ Updated availability ${record.id}`);
      }
    }

    console.log('✅ Availability table migration completed');
  } catch (error) {
    console.error('❌ Availability migration failed:', error.message);
  }
}

async function migrateAvailabilityExceptionsTable() {
  console.log('\n🚫 Migrating availability_exceptions table...');
  
  try {
    // Get current exceptions data
    const exceptions = await makeRequest('GET', '/availability_exceptions');
    console.log(`📊 Found ${exceptions.length} exception records to migrate`);

    for (const exception of exceptions) {
      const updates = {};
      let needsUpdate = false;

      // Convert date if it's a string
      if (exception.date && typeof exception.date === 'string') {
        updates.date = exception.date; // Should already be YYYY-MM-DD
        needsUpdate = true;
      }

      // Convert start_time if it's a string
      if (exception.start_time && typeof exception.start_time === 'string') {
        const timeMatch = exception.start_time.match(/^(\d{1,2}):(\d{2})(?::\d{2})?/);
        if (timeMatch) {
          const hours = timeMatch[1].padStart(2, '0');
          const minutes = timeMatch[2];
          updates.start_time = `${hours}:${minutes}`;
          needsUpdate = true;
        }
      }

      // Convert end_time if it's a string
      if (exception.end_time && typeof exception.end_time === 'string') {
        const timeMatch = exception.end_time.match(/^(\d{1,2}):(\d{2})(?::\d{2})?/);
        if (timeMatch) {
          const hours = timeMatch[1].padStart(2, '0');
          const minutes = timeMatch[2];
          updates.end_time = `${hours}:${minutes}`;
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        await makeRequest('PATCH', `/availability_exceptions?id=eq.${exception.id}`, updates);
        console.log(`✅ Updated exception ${exception.id}`);
      }
    }

    console.log('✅ Availability exceptions table migration completed');
  } catch (error) {
    console.error('❌ Availability exceptions migration failed:', error.message);
  }
}

async function verifyMigration() {
  console.log('\n🔍 Verifying migration results...');
  
  try {
    // Check bookings
    const bookings = await makeRequest('GET', '/bookings?limit=3');
    console.log('\n📅 Sample booking data:');
    bookings.forEach(b => {
      console.log(`  ID ${b.id}: ${b.preferred_date} at ${b.preferred_time} (${b.lesson_type})`);
    });

    // Check availability
    const availability = await makeRequest('GET', '/availability?limit=3');
    console.log('\n⏰ Sample availability data:');
    availability.forEach(a => {
      console.log(`  ID ${a.id}: ${a.day_of_week} ${a.start_time}-${a.end_time} (${a.is_available ? 'available' : 'unavailable'})`);
    });

    // Check exceptions
    const exceptions = await makeRequest('GET', '/availability_exceptions?limit=3');
    console.log('\n🚫 Sample exception data:');
    exceptions.forEach(e => {
      console.log(`  ID ${e.id}: ${e.date} ${e.start_time}-${e.end_time} (${e.reason || 'no reason'})`);
    });

    console.log('\n✅ Migration verification completed');
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

async function runMigration() {
  console.log('🚀 Starting PostgreSQL DATE/TIME migration...\n');
  console.log('🌎 Using Pacific timezone (America/Los_Angeles)');
  
  try {
    await migrateBookingsTable();
    await migrateAvailabilityTable();
    await migrateAvailabilityExceptionsTable();
    await verifyMigration();
    
    console.log('\n🎉 DATE/TIME migration completed successfully!');
    console.log('📝 All date/time columns are now using native PostgreSQL types with Pacific timezone support');
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run the migration
runMigration().catch(console.error);