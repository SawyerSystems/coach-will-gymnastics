import { sql } from './db';
import { 
  users, parents, athletes, bookings, blogPosts, tips, 
  availability, availabilityExceptions, admins, parentAuthCodes, 
  waivers, paymentLogs, bookingLogs, slotReservations 
} from '@shared/schema';

async function createTables() {
  console.log('Creating tables in Supabase...');
  
  try {
    // Drop all tables if they exist (fresh start)
    await sql`DROP TABLE IF EXISTS slot_reservations CASCADE`;
    await sql`DROP TABLE IF EXISTS booking_logs CASCADE`;
    await sql`DROP TABLE IF EXISTS payment_logs CASCADE`;
    await sql`DROP TABLE IF EXISTS waivers CASCADE`;
    await sql`DROP TABLE IF EXISTS parent_auth_codes CASCADE`;
    await sql`DROP TABLE IF EXISTS bookings CASCADE`;
    await sql`DROP TABLE IF EXISTS athletes CASCADE`;
    await sql`DROP TABLE IF EXISTS parents CASCADE`;
    await sql`DROP TABLE IF EXISTS availability_exceptions CASCADE`;
    await sql`DROP TABLE IF EXISTS availability CASCADE`;
    await sql`DROP TABLE IF EXISTS tips CASCADE`;
    await sql`DROP TABLE IF EXISTS blog_posts CASCADE`;
    await sql`DROP TABLE IF EXISTS admins CASCADE`;
    await sql`DROP TABLE IF EXISTS users CASCADE`;
    await sql`DROP TABLE IF EXISTS user_sessions CASCADE`;
    
    console.log('Dropped existing tables...');

    // Create users table
    await sql`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT,
        role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    // Create parents table
    await sql`
      CREATE TABLE parents (
        id SERIAL PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        emergency_contact_name TEXT NOT NULL,
        emergency_contact_phone TEXT NOT NULL,
        waiver_signed BOOLEAN NOT NULL DEFAULT FALSE,
        waiver_signed_at TIMESTAMP,
        waiver_signature_name TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    // Create athletes table
    await sql`
      CREATE TABLE athletes (
        id SERIAL PRIMARY KEY,
        parent_id INTEGER NOT NULL REFERENCES parents(id),
        name TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        date_of_birth TEXT NOT NULL,
        allergies TEXT,
        experience TEXT NOT NULL,
        photo TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    // Create bookings table
    await sql`
      CREATE TABLE bookings (
        id SERIAL PRIMARY KEY,
        lesson_type TEXT NOT NULL,
        athlete1_name TEXT NOT NULL,
        athlete1_date_of_birth TEXT NOT NULL,
        athlete1_allergies TEXT,
        athlete1_experience TEXT NOT NULL,
        athlete2_name TEXT,
        athlete2_date_of_birth TEXT,
        athlete2_allergies TEXT,
        athlete2_experience TEXT,
        preferred_date TEXT NOT NULL,
        preferred_time TEXT NOT NULL,
        focus_areas TEXT[] NOT NULL,
        parent_first_name TEXT NOT NULL,
        parent_last_name TEXT NOT NULL,
        parent_email TEXT NOT NULL,
        parent_phone TEXT NOT NULL,
        emergency_contact_name TEXT NOT NULL,
        emergency_contact_phone TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'confirmed', 'manual', 'manual-paid', 'completed', 'no-show', 'failed', 'cancelled', 'reservation-pending', 'reservation-paid', 'reservation-failed')),
        booking_method TEXT NOT NULL DEFAULT 'online',
        waiver_signed BOOLEAN NOT NULL DEFAULT FALSE,
        waiver_signed_at TIMESTAMP,
        waiver_signature_name TEXT,
        payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'failed', 'refunded', 'reservation-pending', 'reservation-paid', 'reservation-failed', 'session-paid', 'reservation-refunded', 'session-refunded')),
        attendance_status TEXT NOT NULL DEFAULT 'pending',
        reservation_fee_paid BOOLEAN NOT NULL DEFAULT FALSE,
        paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        special_requests TEXT,
        admin_notes TEXT,
        dropoff_person_name TEXT,
        dropoff_person_relationship TEXT,
        dropoff_person_phone TEXT,
        pickup_person_name TEXT,
        pickup_person_relationship TEXT,
        pickup_person_phone TEXT,
        alt_pickup_person_name TEXT,
        alt_pickup_person_relationship TEXT,
        alt_pickup_person_phone TEXT,
        safety_verification_signed BOOLEAN NOT NULL DEFAULT FALSE,
        safety_verification_signed_at TIMESTAMP,
        stripe_session_id TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    // Create blog_posts table
    await sql`
      CREATE TABLE blog_posts (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT NOT NULL,
        category TEXT NOT NULL,
        image_url TEXT,
        published_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    // Create tips table
    await sql`
      CREATE TABLE tips (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        sections JSONB,
        category TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        video_url TEXT,
        published_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    // Create availability table
    await sql`
      CREATE TABLE availability (
        id SERIAL PRIMARY KEY,
        day_of_week INTEGER NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        is_recurring BOOLEAN NOT NULL DEFAULT TRUE,
        is_available BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    // Create availability_exceptions table
    await sql`
      CREATE TABLE availability_exceptions (
        id SERIAL PRIMARY KEY,
        date TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        is_available BOOLEAN NOT NULL DEFAULT FALSE,
        reason TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    // Create admins table
    await sql`
      CREATE TABLE admins (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    // Create parent_auth_codes table
    await sql`
      CREATE TABLE parent_auth_codes (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL,
        code TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    // Create waivers table
    await sql`
      CREATE TABLE waivers (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER NOT NULL REFERENCES bookings(id),
        parent_name TEXT NOT NULL,
        athlete_name TEXT NOT NULL,
        signature_data TEXT NOT NULL,
        pdf_path TEXT,
        ip_address TEXT,
        user_agent TEXT,
        signed_at TIMESTAMP NOT NULL DEFAULT NOW(),
        email_sent_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    // Create payment_logs table
    await sql`
      CREATE TABLE payment_logs (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER REFERENCES bookings(id),
        stripe_event TEXT,
        error_message TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    // Create booking_logs table
    await sql`
      CREATE TABLE booking_logs (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER NOT NULL REFERENCES bookings(id),
        action_type TEXT NOT NULL,
        action_description TEXT NOT NULL,
        previous_value TEXT,
        new_value TEXT,
        performed_by TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    // Create slot_reservations table
    await sql`
      CREATE TABLE slot_reservations (
        id SERIAL PRIMARY KEY,
        date TEXT NOT NULL,
        start_time TEXT NOT NULL,
        lesson_type TEXT NOT NULL,
        session_id TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    // Create archived_waivers table
    await sql`
      CREATE TABLE archived_waivers (
        id SERIAL PRIMARY KEY,
        original_waiver_id INTEGER,
        athlete_name TEXT NOT NULL,
        signer_name TEXT NOT NULL,
        relationship_to_athlete TEXT NOT NULL,
        signature TEXT NOT NULL,
        emergency_contact_number TEXT NOT NULL,
        understands_risks BOOLEAN NOT NULL,
        agrees_to_policies BOOLEAN NOT NULL,
        authorizes_emergency_care BOOLEAN NOT NULL,
        allows_photo_video BOOLEAN NOT NULL,
        confirms_authority BOOLEAN NOT NULL,
        pdf_path TEXT,
        ip_address TEXT,
        user_agent TEXT,
        signed_at TIMESTAMP NOT NULL,
        email_sent_at TIMESTAMP,
        archived_at TIMESTAMP NOT NULL DEFAULT NOW(),
        archive_reason TEXT NOT NULL,
        legal_retention_period TEXT,
        original_parent_id INTEGER,
        original_athlete_id INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    // Create user_sessions table for express-session
    await sql`
      CREATE TABLE user_sessions (
        sid VARCHAR NOT NULL COLLATE "default",
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL
      )
      WITH (OIDS=FALSE)
    `;
    
    await sql`
      ALTER TABLE user_sessions ADD CONSTRAINT session_pkey PRIMARY KEY (sid) NOT DEFERRABLE INITIALLY IMMEDIATE
    `;

    console.log('✅ All tables created successfully in Supabase!');
    
    // Verify connection
    const result = await sql`SELECT current_database(), current_user, version()`;
    console.log('Database info:', result[0]);
    
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
}

// Execute the table creation
createTables().then(() => {
  console.log('Supabase setup completed successfully!');
  process.exit(0);
}).catch(error => {
  console.error('Supabase setup failed:', error);
  process.exit(1);
});