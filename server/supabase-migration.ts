import { supabase } from './supabase-client';

// Create tables using Supabase REST API instead of direct SQL
export async function createSupabaseTablesViaAPI() {
  console.log('🚀 Creating Supabase tables via REST API...');
  
  try {
    // Create tables using raw SQL via Supabase API
    const createTablesSQL = `
      -- Create users table
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create bookings table with all required columns
      CREATE TABLE IF NOT EXISTS bookings (
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
        status TEXT DEFAULT 'pending',
        booking_method TEXT DEFAULT 'online',
        waiver_signed BOOLEAN DEFAULT false,
        waiver_signed_at TIMESTAMP,
        waiver_signature_name TEXT,
        payment_status TEXT DEFAULT 'unpaid',
        attendance_status TEXT DEFAULT 'pending',
        reservation_fee_paid BOOLEAN DEFAULT false,
        paid_amount DECIMAL(10,2) DEFAULT 0.00,
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
        safety_verification_signed BOOLEAN DEFAULT false,
        safety_verification_signed_at TIMESTAMP,
        stripe_session_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Create waivers table
      CREATE TABLE IF NOT EXISTS waivers (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER,
        athlete_id INTEGER,
        parent_id INTEGER,
        athlete_name TEXT NOT NULL,
        signer_name TEXT NOT NULL,
        relationship_to_athlete TEXT DEFAULT 'Parent/Guardian',
        signature TEXT NOT NULL,
        emergency_contact_number TEXT NOT NULL,
        understands_risks BOOLEAN DEFAULT false,
        agrees_to_policies BOOLEAN DEFAULT false,
        authorizes_emergency_care BOOLEAN DEFAULT false,
        allows_photo_video BOOLEAN DEFAULT true,
        confirms_authority BOOLEAN DEFAULT false,
        pdf_path TEXT,
        ip_address TEXT,
        user_agent TEXT,
        signed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        email_sent_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Create parents table  
      CREATE TABLE IF NOT EXISTS parents (
        id SERIAL PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        emergency_contact_name TEXT NOT NULL,
        emergency_contact_phone TEXT NOT NULL,
        waiver_signed BOOLEAN DEFAULT false,
        waiver_signed_at TIMESTAMP,
        waiver_signature_name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Create athletes table
      CREATE TABLE IF NOT EXISTS athletes (
        id SERIAL PRIMARY KEY,
        parent_id INTEGER,
        name TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        date_of_birth TEXT NOT NULL,
        allergies TEXT,
        experience TEXT NOT NULL,
        photo TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Create admins table
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Create parent_auth_codes table
      CREATE TABLE IF NOT EXISTS parent_auth_codes (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Create availability table
      CREATE TABLE IF NOT EXISTS availability (
        id SERIAL PRIMARY KEY,
        day_of_week INTEGER NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        is_recurring BOOLEAN DEFAULT true,
        is_available BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Create availability_exceptions table
      CREATE TABLE IF NOT EXISTS availability_exceptions (
        id SERIAL PRIMARY KEY,
        date TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        is_available BOOLEAN DEFAULT false,
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create blog_posts table
      CREATE TABLE IF NOT EXISTS blog_posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        excerpt TEXT,
        content TEXT NOT NULL,
        category VARCHAR(100),
        published_date DATE,
        is_published BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create tips table
      CREATE TABLE IF NOT EXISTS tips (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        content TEXT NOT NULL,
        difficulty_level VARCHAR(20) DEFAULT 'beginner',
        apparatus VARCHAR(50),
        video_url TEXT,
        is_published BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes for performance
      CREATE INDEX IF NOT EXISTS idx_bookings_parent_id ON bookings(parent_id);
      CREATE INDEX IF NOT EXISTS idx_bookings_lesson_date ON bookings(lesson_date);
      CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
      CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
      CREATE INDEX IF NOT EXISTS idx_tips_slug ON tips(slug);
      CREATE INDEX IF NOT EXISTS idx_tips_apparatus ON tips(apparatus);
    `;

    // Execute the SQL using Supabase's RPC function
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: createTablesSQL
    });

    if (error) {
      console.error('❌ Table creation failed:', error);
      // If RPC doesn't work, try direct table creation
      await createTablesDirectly();
    } else {
      console.log('✅ Tables created successfully via RPC');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    // Fallback to direct table creation
    await createTablesDirectly();
  }
}

async function createTablesDirectly() {
  console.log('Attempting direct table creation...');
  
  try {
    // Create users table
    const { error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (usersError && usersError.code === 'PGRST116') {
      console.log('Creating users table...');
      // Table doesn't exist, but we can't create it via REST API
      // We'll need to use the SQL editor in Supabase dashboard
    }
    
    // For now, let's just verify we can connect
    const { data, error } = await supabase.auth.getSession();
    if (!error) {
      console.log('✅ Supabase connection successful');
    }
    
  } catch (error) {
    console.error('❌ Direct table creation failed:', error);
  }
}

// Migration function to populate sample data
export async function migrateSampleData() {
  console.log('🔄 Migrating sample data...');
  
  try {
    // Add sample blog posts
    const { error: blogError } = await supabase
      .from('blog_posts')
      .upsert([
        {
          title: 'Welcome to Coach Will\'s Adventure Journal',
          slug: 'welcome-to-adventure-journal',
          excerpt: 'Every gymnastics journey begins with a single step. Discover what makes each athlete\'s adventure unique.',
          content: 'Welcome to our adventure journal! Here, we document the incredible journeys of young gymnasts as they discover their strength, grace, and confidence...',
          category: 'Welcome',
          published_date: new Date().toISOString().split('T')[0],
          is_published: true
        }
      ], { onConflict: 'slug' });

    if (blogError) {
      console.error('Blog migration error:', blogError);
    } else {
      console.log('✅ Blog posts migrated');
    }

    // Add sample tips
    const { error: tipsError } = await supabase
      .from('tips')
      .upsert([
        {
          title: 'Perfect Cartwheel Quest',
          slug: 'perfect-cartwheel-quest',
          content: 'The cartwheel is a fundamental skill that builds strength, coordination, and confidence. Master this move to unlock more advanced tumbling adventures!',
          difficulty_level: 'beginner',
          apparatus: 'tumbling',
          is_published: true
        }
      ], { onConflict: 'slug' });

    if (tipsError) {
      console.error('Tips migration error:', tipsError);
    } else {
      console.log('✅ Tips migrated');
    }

  } catch (error) {
    console.error('❌ Sample data migration failed:', error);
  }
}