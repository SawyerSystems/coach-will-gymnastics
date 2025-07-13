import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://nwdgtdzrcyfmislilucy.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53ZGd0ZHpyY3lmbWlzbGlsdWN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0NzEzODEsImV4cCI6MjA1MTA0NzM4MX0.VfrV3cET0lLQsOPRAUfgTPRoMVONhK0aYI6LM-8rKoo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fixAthleteIssues() {
  console.log('🔧 Starting Supabase Athlete Fix...\n');

  try {
    // 1. Get all bookings
    console.log('1️⃣ Fetching all bookings...');
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
      return;
    }

    console.log(`Found ${bookings.length} bookings\n`);

    // 2. Get all parents
    console.log('2️⃣ Fetching all parents...');
    const { data: parents, error: parentsError } = await supabase
      .from('parents')
      .select('*');

    if (parentsError) {
      console.error('Error fetching parents:', parentsError);
      return;
    }

    console.log(`Found ${parents.length} parents\n`);

    // 3. Get existing athletes
    console.log('3️⃣ Fetching existing athletes...');
    const { data: existingAthletes, error: athletesError } = await supabase
      .from('athletes')
      .select('*');

    if (athletesError) {
      console.error('Error fetching athletes:', athletesError);
      return;
    }

    console.log(`Found ${existingAthletes.length} existing athletes\n`);

    // 4. Create missing athletes from bookings
    console.log('4️⃣ Creating missing athletes from bookings...');
    let athletesCreated = 0;

    for (const booking of bookings) {
      // Find parent for this booking
      const parent = parents.find(p => 
        p.email === booking.parent_email && 
        p.phone === booking.parent_phone
      );

      if (!parent) {
        console.log(`⚠️  No parent found for booking ${booking.id} (${booking.parent_email})`);
        continue;
      }

      // Check athlete 1
      if (booking.athlete1_name && booking.athlete1_date_of_birth) {
        const athleteExists = existingAthletes.some(a => 
          a.name === booking.athlete1_name && 
          a.date_of_birth === booking.athlete1_date_of_birth &&
          a.parent_id === parent.id
        );

        if (!athleteExists) {
          const nameParts = booking.athlete1_name.split(' ');
          const firstName = nameParts[0];
          const lastName = nameParts.slice(1).join(' ') || '';

          const { data: newAthlete, error: createError } = await supabase
            .from('athletes')
            .insert({
              parent_id: parent.id,
              name: booking.athlete1_name,
              first_name: firstName,
              last_name: lastName,
              date_of_birth: booking.athlete1_date_of_birth,
              experience: booking.athlete1_experience || 'beginner',
              allergies: booking.athlete1_allergies || null
            })
            .select()
            .single();

          if (createError) {
            console.error(`Error creating athlete ${booking.athlete1_name}:`, createError);
          } else {
            console.log(`✅ Created athlete: ${booking.athlete1_name} (Parent: ${parent.email})`);
            athletesCreated++;
            existingAthletes.push(newAthlete);
          }
        }
      }

      // Check athlete 2
      if (booking.athlete2_name && booking.athlete2_date_of_birth) {
        const athleteExists = existingAthletes.some(a => 
          a.name === booking.athlete2_name && 
          a.date_of_birth === booking.athlete2_date_of_birth &&
          a.parent_id === parent.id
        );

        if (!athleteExists) {
          const nameParts = booking.athlete2_name.split(' ');
          const firstName = nameParts[0];
          const lastName = nameParts.slice(1).join(' ') || '';

          const { data: newAthlete, error: createError } = await supabase
            .from('athletes')
            .insert({
              parent_id: parent.id,
              name: booking.athlete2_name,
              first_name: firstName,
              last_name: lastName,
              date_of_birth: booking.athlete2_date_of_birth,
              experience: booking.athlete2_experience || 'beginner',
              allergies: booking.athlete2_allergies || null
            })
            .select()
            .single();

          if (createError) {
            console.error(`Error creating athlete ${booking.athlete2_name}:`, createError);
          } else {
            console.log(`✅ Created athlete: ${booking.athlete2_name} (Parent: ${parent.email})`);
            athletesCreated++;
            existingAthletes.push(newAthlete);
          }
        }
      }
    }

    console.log(`\n✅ Created ${athletesCreated} new athletes\n`);

    // 5. Verify the fix
    console.log('5️⃣ Verifying the fix...');
    const { data: finalAthletes, error: finalError } = await supabase
      .from('athletes')
      .select('*')
      .order('created_at', { ascending: false });

    if (finalError) {
      console.error('Error fetching final athletes:', finalError);
    } else {
      console.log(`Total athletes in database: ${finalAthletes.length}`);
      if (finalAthletes.length > 0) {
        console.log('\nSample athletes:');
        finalAthletes.slice(0, 3).forEach(athlete => {
          console.log(`- ${athlete.name} (Parent ID: ${athlete.parent_id})`);
        });
      }
    }

    console.log('\n✅ Fix completed!');

  } catch (error) {
    console.error('❌ Error during fix:', error);
  }
}

// Run the fix
fixAthleteIssues();