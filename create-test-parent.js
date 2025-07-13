import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qhafuzkhqfcrnmrwkcbz.supabase.co';
const supabaseServiceKey = '***REMOVED***';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestParent() {
  console.log('🧪 Creating Test Parent Account');
  console.log('='.repeat(40));

  try {
    // 1. Create test parent
    console.log('Creating test parent...');
    const testParent = {
      first_name: 'Test',
      last_name: 'Parent',
      email: 'testparent@example.com',
      phone: '5551234567',
      emergency_contact_name: 'Emergency Contact',
      emergency_contact_phone: '5559876543',
      emergency_contact_relationship: 'Parent'
    };

    // Check if parent already exists
    const { data: existingParent } = await supabase
      .from('parents')
      .select('*')
      .eq('email', testParent.email)
      .single();

    let parentId;
    if (existingParent) {
      console.log('✅ Test parent already exists, using existing account');
      parentId = existingParent.id;
    } else {
      const { data: newParent, error: parentError } = await supabase
        .from('parents')
        .insert(testParent)
        .select('*')
        .single();

      if (parentError) {
        console.error('❌ Failed to create parent:', parentError);
        return;
      }

      console.log('✅ Test parent created successfully');
      parentId = newParent.id;
    }

    // 2. Create fixed auth code
    console.log('Creating fixed auth code...');
    
    // Delete any existing auth codes for this parent
    await supabase
      .from('parent_auth_codes')
      .delete()
      .eq('email', testParent.email);

    const fixedAuthCode = {
      email: testParent.email,
      code: '123456',  // Fixed 6-digit code
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
      used: false
    };

    const { error: authError } = await supabase
      .from('parent_auth_codes')
      .insert(fixedAuthCode);

    if (authError) {
      console.error('❌ Failed to create auth code:', authError);
      return;
    }

    console.log('✅ Fixed auth code created');

    // 3. Create test athlete
    console.log('Creating test athlete...');
    
    // Check if athlete already exists
    const { data: existingAthlete } = await supabase
      .from('athletes')
      .select('*')
      .eq('parent_id', parentId)
      .eq('name', 'Test Child')
      .single();

    if (existingAthlete) {
      console.log('✅ Test athlete already exists');
    } else {
      const testAthlete = {
        parent_id: parentId,
        name: 'Test Child',
        first_name: 'Test',
        last_name: 'Child',
        date_of_birth: '2015-06-15',
        allergies: 'None',
        experience: 'beginner'
      };

      const { error: athleteError } = await supabase
        .from('athletes')
        .insert(testAthlete);

      if (athleteError) {
        console.error('❌ Failed to create athlete:', athleteError);
        return;
      }

      console.log('✅ Test athlete created successfully');
    }

    // 4. Create test booking
    console.log('Creating test booking...');
    
    const testBooking = {
      lesson_type: 'quick-journey',
      athlete1_name: 'Test Child',
      athlete1_date_of_birth: '2015-06-15',
      athlete1_experience: 'beginner',
      athlete1_allergies: 'None',
      preferred_date: '2025-07-10',
      preferred_time: '10:00',
      focus_areas: ['Tumbling: Forward Roll'],
      parent_first_name: 'Test',
      parent_last_name: 'Parent',
      parent_email: 'testparent@example.com',
      parent_phone: '5551234567',
      emergency_contact_name: 'Emergency Contact',
      emergency_contact_phone: '5559876543',
      dropoff_person_name: 'Test Parent',
      dropoff_person_phone: '5551234567',
      dropoff_person_relationship: 'Parent',
      pickup_person_name: 'Test Parent',
      pickup_person_phone: '5551234567',
      pickup_person_relationship: 'Parent',
      amount: '10.00',
      status: 'pending',
      payment_status: 'reservation-pending',
      attendance_status: 'pending',
      booking_method: 'online',
      waiver_signed: false
    };

    const { error: bookingError } = await supabase
      .from('bookings')
      .insert(testBooking);

    if (bookingError) {
      console.error('❌ Failed to create booking:', bookingError);
      return;
    }

    console.log('✅ Test booking created successfully');

    console.log('\n' + '='.repeat(40));
    console.log('🎉 TEST ACCOUNT SETUP COMPLETE!');
    console.log('='.repeat(40));
    console.log('📧 Email: testparent@example.com');
    console.log('🔐 Auth Code: 123456 (fixed, no email required)');
    console.log('👶 Child: Test Child (15 years old)');
    console.log('📅 Booking: July 10, 2025 at 10:00 AM');
    console.log('\n✅ Ready for comprehensive testing!');

  } catch (error) {
    console.error('❌ Error creating test account:', error);
  }
}

// Run the script
createTestParent();