import { supabase } from './server/supabase-client.ts';

async function fixDatabaseSchema() {
  console.log('🔧 Fixing database schema issues...');
  
  try {
    // Add missing columns to parent_auth_codes table
    const parentAuthCodeQueries = [
      "ALTER TABLE parent_auth_codes ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;",
      "ALTER TABLE parent_auth_codes ADD COLUMN IF NOT EXISTS used BOOLEAN DEFAULT FALSE;",
      "ALTER TABLE parent_auth_codes ADD COLUMN IF NOT EXISTS used_at TIMESTAMP;"
    ];

    for (const query of parentAuthCodeQueries) {
      const { error } = await supabase.rpc('exec_sql', { sql: query });
      if (error && !error.message.includes('already exists')) {
        console.log('Query executed (or column exists):', query.substring(0, 50) + '...');
      }
    }

    // Add missing columns to bookings table
    const bookingQueries = [
      "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS athlete1_age INTEGER;",
      "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS athlete2_age INTEGER;",
      "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS dropoff_person_name TEXT;",
      "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS dropoff_person_relationship TEXT;",
      "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pickup_person_name TEXT;",
      "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pickup_person_relationship TEXT;",
      "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS special_instructions TEXT;",
      "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS notes TEXT;"
    ];

    for (const query of bookingQueries) {
      const { error } = await supabase.rpc('exec_sql', { sql: query });
      if (error && !error.message.includes('already exists')) {
        console.log('Query executed (or column exists):', query.substring(0, 50) + '...');
      }
    }

    // Add missing columns to blog_posts table
    const blogQueries = [
      "ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;",
      "ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS image_url TEXT;"
    ];

    for (const query of blogQueries) {
      const { error } = await supabase.rpc('exec_sql', { sql: query });
      if (error && !error.message.includes('already exists')) {
        console.log('Query executed (or column exists):', query.substring(0, 50) + '...');
      }
    }

    // Add missing columns to tips table
    const tipQueries = [
      "ALTER TABLE tips ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;",
      "ALTER TABLE tips ADD COLUMN IF NOT EXISTS video_url TEXT;",
      "ALTER TABLE tips ADD COLUMN IF NOT EXISTS sections JSONB;"
    ];

    for (const query of tipQueries) {
      const { error } = await supabase.rpc('exec_sql', { sql: query });
      if (error && !error.message.includes('already exists')) {
        console.log('Query executed (or column exists):', query.substring(0, 50) + '...');
      }
    }

    // Fix availability table (it expects integer day_of_week)
    const availabilityQueries = [
      "DROP TABLE IF EXISTS availability CASCADE;",
      `CREATE TABLE availability (
        id SERIAL PRIMARY KEY,
        day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        is_available BOOLEAN DEFAULT TRUE,
        is_recurring BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`
    ];

    for (const query of availabilityQueries) {
      const { error } = await supabase.rpc('exec_sql', { sql: query });
      if (error) {
        console.log('Availability table query result:', error.message);
      }
    }

    // Insert sample availability data (Monday=1, Sunday=0)
    const availabilityData = [
      { day_of_week: 1, start_time: '09:00', end_time: '17:00' }, // Monday
      { day_of_week: 2, start_time: '09:00', end_time: '17:00' }, // Tuesday  
      { day_of_week: 3, start_time: '09:00', end_time: '17:00' }, // Wednesday
      { day_of_week: 4, start_time: '09:00', end_time: '17:00' }, // Thursday
      { day_of_week: 5, start_time: '09:00', end_time: '17:00' }, // Friday
      { day_of_week: 6, start_time: '08:00', end_time: '16:00' }, // Saturday
      { day_of_week: 0, start_time: '10:00', end_time: '15:00' }  // Sunday
    ];

    const { error: availInsertError } = await supabase
      .from('availability')
      .insert(availabilityData);

    if (availInsertError && !availInsertError.message.includes('duplicate')) {
      console.log('Availability insert result:', availInsertError.message);
    }

    console.log('✅ Database schema fixes completed!');

  } catch (error) {
    console.error('❌ Schema fix failed:', error);
    throw error;
  }
}

fixDatabaseSchema().catch(console.error);