// Test parent-athlete relationships in booking creation
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testParentAthleteRelationships() {
  console.log('Testing parent-athlete relationships...\n');
  
  // Create a test booking and verify relationships
  console.log('1. Creating test booking...');
  const response = await fetch('http://localhost:5001/api/booking/new-user-flow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lessonType: "quick-journey",
      parentFirstName: "Test",
      parentLastName: "Parent", 
      parentEmail: "test.parent@example.com",
      parentPhone: "555-1234",
      emergencyContactName: "Emergency Contact",
      emergencyContactPhone: "555-5678",
      preferredDate: "2025-07-15",
      preferredTime: "10:00",
      amount: 75,
      athletes: [
        {
          name: "Test Child",
          dateOfBirth: "2015-06-01",
          allergies: "None",
          experience: "Beginner",
          slotOrder: 1
        }
      ],
      focusAreaIds: [1, 2],
      apparatusIds: [1],
      sideQuestIds: []
    })
  });
  
  if (!response.ok) {
    console.error('❌ Booking creation failed:', await response.text());
    return;
  }
  
  const booking = await response.json();
  console.log(`✅ Booking created: ID ${booking.id}`);
  
  // Check parents table
  console.log('\n2. Checking parents table...');
  const parents = await supabase
    .from('parents')
    .select('*');
    
  console.log(`Parents found: ${parents.data?.length || 0}`);
  parents.data?.forEach(parent => {
    console.log(`  Parent ID ${parent.id}: ${parent.first_name} ${parent.last_name} (${parent.email})`);
  });
  
  // Check athletes table
  console.log('\n3. Checking athletes table...');
  const athletes = await supabase
    .from('athletes')
    .select('*');
    
  console.log(`Athletes found: ${athletes.data?.length || 0}`);
  athletes.data?.forEach(athlete => {
    console.log(`  Athlete ID ${athlete.id}: ${athlete.name} (Parent ID: ${athlete.parent_id})`);
  });
  
  // Check for orphaned athletes (athletes without valid parent_id)
  console.log('\n4. Checking for orphaned athletes...');
  const orphanedAthletes = await supabase
    .from('athletes')
    .select('*')
    .is('parent_id', null);
    
  if (orphanedAthletes.data && orphanedAthletes.data.length > 0) {
    console.log('❌ FOUND ORPHANED ATHLETES:');
    orphanedAthletes.data.forEach(athlete => {
      console.log(`  - Athlete ID ${athlete.id}: ${athlete.name} has no parent_id`);
    });
  } else {
    console.log('✅ No orphaned athletes found');
  }
  
  // Check parent-athlete relationships
  console.log('\n5. Verifying parent-athlete relationships...');
  const athletesWithParents = await supabase
    .from('athletes')
    .select(`
      id,
      name,
      parent_id,
      parents:parent_id (
        id,
        first_name,
        last_name,
        email
      )
    `);
    
  if (athletesWithParents.data) {
    console.log('Parent-Athlete relationships:');
    athletesWithParents.data.forEach(athlete => {
      if (athlete.parents) {
        console.log(`✅ Athlete "${athlete.name}" → Parent "${athlete.parents.first_name} ${athlete.parents.last_name}"`);
      } else {
        console.log(`❌ Athlete "${athlete.name}" has NO VALID PARENT RELATIONSHIP`);
      }
    });
  }
  
  // Check booking_athletes relationships
  console.log('\n6. Checking booking-athlete connections...');
  const bookingAthletes = await supabase
    .from('booking_athletes')
    .select(`
      booking_id,
      athlete_id,
      slot_order,
      athletes:athlete_id (
        name,
        parent_id
      )
    `);
    
  if (bookingAthletes.data && bookingAthletes.data.length > 0) {
    console.log('Booking-Athlete relationships:');
    bookingAthletes.data.forEach(ba => {
      console.log(`  Booking ${ba.booking_id} → Athlete "${ba.athletes?.name}" (Parent ID: ${ba.athletes?.parent_id})`);
    });
  } else {
    console.log('❌ No booking-athlete relationships found');
  }
  
  console.log('\n7. Summary:');
  const totalParents = parents.data?.length || 0;
  const totalAthletes = athletes.data?.length || 0;
  const orphanedCount = orphanedAthletes.data?.length || 0;
  
  console.log(`- Total Parents: ${totalParents}`);
  console.log(`- Total Athletes: ${totalAthletes}`);
  console.log(`- Orphaned Athletes: ${orphanedCount}`);
  
  if (orphanedCount === 0 && totalAthletes > 0) {
    console.log('✅ SUCCESS: All athletes are properly connected to parents!');
  } else if (orphanedCount > 0) {
    console.log('❌ FAILURE: Found athletes without parent connections!');
  } else {
    console.log('⚠️  No athletes found to test');
  }
}

testParentAthleteRelationships().catch(console.error);
