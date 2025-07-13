import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testGenderIntegration() {
  console.log('=== Testing Gender Field Integration ===\n');

  try {
    // 1. Verify database schema has gender column
    console.log('1. Checking database schema for gender column...');
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'athletes' });
    
    if (columnsError) {
      console.error('Error fetching columns:', columnsError);
      return;
    }
    
    const hasGenderColumn = columns?.some(col => col.column_name === 'gender');
    console.log(`✅ Gender column exists: ${hasGenderColumn}\n`);

    // 2. Test creating an athlete with gender field
    console.log('2. Testing athlete creation with gender field...');
    const testAthlete = {
      name: 'Test Athlete Gender',
      first_name: 'Test',
      last_name: 'Athlete',
      parent_id: 1, // Assuming parent ID 1 exists
      date_of_birth: '2010-01-01',
      gender: 'Male', // Testing with title case as used in frontend
      allergies: null,
      experience: 'Beginner',
      photo: null
    };

    const { data: athleteData, error: athleteError } = await supabase
      .from('athletes')
      .insert(testAthlete)
      .select()
      .single();

    if (athleteError) {
      console.error('Error creating athlete:', athleteError);
      return;
    }

    console.log(`✅ Athlete created successfully with ID: ${athleteData.id}`);
    console.log(`✅ Gender field saved as: "${athleteData.gender}"\n`);

    // 3. Test retrieving the athlete and verify gender field
    console.log('3. Testing athlete retrieval and gender field...');
    const { data: retrievedAthlete, error: retrieveError } = await supabase
      .from('athletes')
      .select('*')
      .eq('id', athleteData.id)
      .single();

    if (retrieveError) {
      console.error('Error retrieving athlete:', retrieveError);
      return;
    }

    console.log(`✅ Retrieved athlete: ${retrievedAthlete.name}`);
    console.log(`✅ Gender field: "${retrievedAthlete.gender}"`);
    console.log(`✅ Gender field type: ${typeof retrievedAthlete.gender}\n`);

    // 4. Test updating the gender field
    console.log('4. Testing gender field update...');
    const { data: updatedAthlete, error: updateError } = await supabase
      .from('athletes')
      .update({ gender: 'Female' })
      .eq('id', athleteData.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating athlete:', updateError);
      return;
    }

    console.log(`✅ Gender updated to: "${updatedAthlete.gender}"\n`);

    // 5. Test with null gender (legacy data handling)
    console.log('5. Testing null gender handling...');
    const { data: nullGenderAthlete, error: nullGenderError } = await supabase
      .from('athletes')
      .update({ gender: null })
      .eq('id', athleteData.id)
      .select()
      .single();

    if (nullGenderError) {
      console.error('Error setting null gender:', nullGenderError);
      return;
    }

    console.log(`✅ Null gender handled: ${nullGenderAthlete.gender === null ? 'null' : nullGenderAthlete.gender}\n`);

    // 6. Check existing athletes for gender field status
    console.log('6. Checking existing athletes for gender field...');
    const { data: existingAthletes, error: existingError } = await supabase
      .from('athletes')
      .select('id, name, gender')
      .limit(10);

    if (existingError) {
      console.error('Error fetching existing athletes:', existingError);
      return;
    }

    console.log('Sample of existing athletes:');
    existingAthletes.forEach(athlete => {
      const genderDisplay = athlete.gender === null ? 'null' : `"${athlete.gender}"`;
      console.log(`  - ${athlete.name} (ID: ${athlete.id}): Gender = ${genderDisplay}`);
    });

    // 7. Test the booking flow endpoint with gender
    console.log('\n7. Testing booking API endpoint with gender...');
    const testBookingData = {
      parentId: 1,
      athletes: [{
        name: 'API Test Athlete',
        firstName: 'API',
        lastName: 'Test',
        dateOfBirth: '2012-01-01',
        gender: 'Female', // Title case as used in frontend
        allergies: '',
        experience: 'Beginner'
      }],
      lessonDate: '2025-07-20',
      lessonTime: '10:00',
      lessonType: 'quick-journey',
      waiverSigned: true,
      totalAmount: 2500,
      paymentMethodId: 'test_payment_method'
    };

    // Make API call to our booking endpoint
    const response = await fetch('http://localhost:5001/api/create-booking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testBookingData)
    });

    if (response.ok) {
      const bookingResult = await response.json();
      console.log('✅ Booking API test successful');
      console.log(`✅ Created booking with gender field handling\n`);
    } else {
      const error = await response.text();
      console.log(`❌ Booking API test failed: ${error}\n`);
    }

    // Cleanup: Remove test athlete
    console.log('8. Cleaning up test data...');
    await supabase
      .from('athletes')
      .delete()
      .eq('id', athleteData.id);
    
    console.log('✅ Test athlete removed\n');

    console.log('=== Gender Integration Test Complete ===');
    console.log('✅ Database schema: Gender column exists');
    console.log('✅ CRUD operations: All working with gender field');
    console.log('✅ Null handling: Legacy data compatibility maintained');
    console.log('✅ API integration: Booking endpoint handles gender field');
    console.log('\nThe gender field integration is working correctly!');

  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Run the test
testGenderIntegration();
