import { supabase } from './server/supabase-client.ts';

async function setupDatabase() {
  console.log('🚀 Setting up database with test data...');
  
  try {
    // Create admin account
    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .insert([
        {
          email: 'admin@cwtumbles.com',
          password_hash: '$2b$12$7I7tgFQdJvY8P1.VJgj1KOHqwNYNcBHjN/BXjGGqiPBMIXNBgJJu6' // TumbleCoach2025!
        }
      ])
      .select()
      .single();

    if (adminError && adminError.code !== '23505') { // 23505 = duplicate key
      console.error('❌ Admin creation failed:', adminError);
    } else {
      console.log('✅ Admin account created/verified');
    }

    // Create test parent
    const { data: parent, error: parentError } = await supabase
      .from('parents')
      .insert([
        {
          first_name: 'Test',
          last_name: 'Parent',
          email: 'test@parent.com',
          phone: '555-123-4567',
          emergency_contact_name: 'Emergency Contact',
          emergency_contact_phone: '555-987-6543',
          waiver_signed: true,
          waiver_signed_at: new Date().toISOString(),
          waiver_signature_name: 'Test Parent'
        }
      ])
      .select()
      .single();

    if (parentError && parentError.code !== '23505') {
      console.error('❌ Parent creation failed:', parentError);
    } else {
      console.log('✅ Test parent created/verified');
    }

    // Get parent ID for athlete creation
    const { data: parentRecord } = await supabase
      .from('parents')
      .select('id')
      .eq('email', 'test@parent.com')
      .single();

    if (parentRecord) {
      // Create test athlete
      const { data: athlete, error: athleteError } = await supabase
        .from('athletes')
        .insert([
          {
            parent_id: parentRecord.id,
            name: 'Test Athlete',
            first_name: 'Test',
            last_name: 'Athlete',
            date_of_birth: '2015-05-15',
            allergies: 'None',
            experience: 'beginner'
          }
        ])
        .select()
        .single();

      if (athleteError && athleteError.code !== '23505') {
        console.error('❌ Athlete creation failed:', athleteError);
      } else {
        console.log('✅ Test athlete created/verified');
      }

      // Create test booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert([
          {
            lesson_type: 'quick-journey',
            lesson_date: '2025-07-10',
            lesson_time: '10:00',
            duration: 30,
            athlete1_name: 'Test Athlete',
            athlete1_age: 9,
            athlete1_experience: 'beginner',
            athlete1_allergies: 'None',
            parent_first_name: 'Test',
            parent_last_name: 'Parent',
            parent_email: 'test@parent.com',
            parent_phone: '555-123-4567',
            emergency_contact_name: 'Emergency Contact',
            emergency_contact_phone: '555-987-6543',
            focus_areas: ['Floor: Forward Roll', 'Beam: Straight Line Walk'],
            status: 'confirmed',
            payment_status: 'paid',
            attendance_status: 'confirmed',
            amount: 40.00,
            waiver_signed: true,
            waiver_signed_at: new Date().toISOString(),
            waiver_signature_name: 'Test Parent'
          }
        ])
        .select()
        .single();

      if (bookingError && bookingError.code !== '23505') {
        console.error('❌ Booking creation failed:', bookingError);
      } else {
        console.log('✅ Test booking created/verified');
      }
    }

    // Create sample blog posts
    const { data: blogPost, error: blogError } = await supabase
      .from('blog_posts')
      .insert([
        {
          title: 'Getting Started with Gymnastics',
          excerpt: 'Learn the fundamentals of gymnastics training',
          content: 'Content for getting started with gymnastics...',
          category: 'training',
          featured: true,
          published_at: new Date().toISOString()
        },
        {
          title: 'Safety First in Gymnastics',
          excerpt: 'Essential safety tips for young gymnasts',
          content: 'Content about gymnastics safety...',
          category: 'safety',
          featured: false,
          published_at: new Date().toISOString()
        }
      ])
      .select();

    if (blogError && blogError.code !== '23505') {
      console.error('❌ Blog post creation failed:', blogError);
    } else {
      console.log('✅ Sample blog posts created/verified');
    }

    // Create sample tips
    const { data: tip, error: tipError } = await supabase
      .from('tips')
      .insert([
        {
          title: 'Perfect Your Forward Roll',
          content: 'Tips for mastering the forward roll technique',
          category: 'tumbling',
          difficulty: 'beginner',
          featured: true,
          published_at: new Date().toISOString()
        },
        {
          title: 'Balance Beam Basics',
          content: 'Essential balance beam techniques for beginners',
          category: 'beam',
          difficulty: 'beginner',
          featured: false,
          published_at: new Date().toISOString()
        }
      ])
      .select();

    if (tipError && tipError.code !== '23505') {
      console.error('❌ Tip creation failed:', tipError);
    } else {
      console.log('✅ Sample tips created/verified');
    }

    // Create sample availability
    const { data: availability, error: availabilityError } = await supabase
      .from('availability')
      .insert([
        {
          day_of_week: 'Monday',
          start_time: '09:00',
          end_time: '17:00',
          is_available: true
        },
        {
          day_of_week: 'Tuesday',
          start_time: '09:00',
          end_time: '17:00',
          is_available: true
        },
        {
          day_of_week: 'Wednesday',
          start_time: '09:00',
          end_time: '17:00',
          is_available: true
        },
        {
          day_of_week: 'Thursday',
          start_time: '09:00',
          end_time: '17:00',
          is_available: true
        },
        {
          day_of_week: 'Friday',
          start_time: '09:00',
          end_time: '17:00',
          is_available: true
        },
        {
          day_of_week: 'Saturday',
          start_time: '08:00',
          end_time: '16:00',
          is_available: true
        },
        {
          day_of_week: 'Sunday',
          start_time: '10:00',
          end_time: '15:00',
          is_available: true
        }
      ])
      .select();

    if (availabilityError && availabilityError.code !== '23505') {
      console.error('❌ Availability creation failed:', availabilityError);
    } else {
      console.log('✅ Sample availability created/verified');
    }

    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  }
}

// Only run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase().catch(console.error);
}

export { setupDatabase };