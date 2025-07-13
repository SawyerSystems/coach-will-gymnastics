// Check athlete-parent relationships in recent bookings
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

async function checkAthleteParentRelationships() {
  console.log('Checking athlete-parent relationships...\n');
  
  // Get recent bookings with parent info
  const bookings = await supabase
    .from('bookings')
    .select('id, parent_email, parent_first_name, parent_last_name')
    .order('id', { ascending: false })
    .limit(5);
    
  console.log('Recent Bookings:');
  bookings.data?.forEach(booking => {
    console.log(`  Booking ${booking.id}: ${booking.parent_first_name} ${booking.parent_last_name} (${booking.parent_email})`);
  });
  
  // Get booking_athletes relationships
  console.log('\nBooking-Athlete Relationships:');
  const bookingAthletes = await supabase
    .from('booking_athletes')
    .select('booking_id, athlete_id, slot_order')
    .order('booking_id', { ascending: false })
    .limit(10);
    
  bookingAthletes.data?.forEach(ba => {
    console.log(`  Booking ${ba.booking_id} -> Athlete ${ba.athlete_id} (slot ${ba.slot_order})`);
  });
  
  // Get athletes with their parent connections
  console.log('\nAthletes and their Parents:');
  const athletes = await supabase
    .from('athletes')
    .select('id, name, parent_id')
    .order('id', { ascending: false })
    .limit(10);
    
  for (const athlete of athletes.data || []) {
    // Get parent info
    const parent = await supabase
      .from('parents')
      .select('id, first_name, last_name, email')
      .eq('id', athlete.parent_id)
      .single();
      
    if (parent.data) {
      console.log(`  Athlete ${athlete.id}: "${athlete.name}" -> Parent ${parent.data.id}: ${parent.data.first_name} ${parent.data.last_name} (${parent.data.email})`);
    } else {
      console.log(`  Athlete ${athlete.id}: "${athlete.name}" -> ❌ NO PARENT CONNECTION (parent_id: ${athlete.parent_id})`);
    }
  }
  
  // Check for orphaned athletes (no parent connection)
  console.log('\nChecking for orphaned athletes...');
  const orphanedAthletes = await supabase
    .from('athletes')
    .select('id, name, parent_id')
    .is('parent_id', null);
    
  if (orphanedAthletes.data && orphanedAthletes.data.length > 0) {
    console.log(`❌ Found ${orphanedAthletes.data.length} orphaned athletes:`);
    orphanedAthletes.data.forEach(athlete => {
      console.log(`  - Athlete ${athlete.id}: "${athlete.name}" (no parent_id)`);
    });
  } else {
    console.log('✅ No orphaned athletes found');
  }
  
  // Check for missing parents referenced by athletes
  console.log('\nChecking for missing parent references...');
  const athletesWithParents = await supabase
    .from('athletes')
    .select('id, name, parent_id')
    .not('parent_id', 'is', null);
    
  for (const athlete of athletesWithParents.data || []) {
    const parentExists = await supabase
      .from('parents')
      .select('id')
      .eq('id', athlete.parent_id)
      .single();
      
    if (parentExists.error) {
      console.log(`❌ Athlete ${athlete.id} "${athlete.name}" references non-existent parent ${athlete.parent_id}`);
    }
  }
  
  console.log('✅ Parent reference check complete');
}

checkAthleteParentRelationships().catch(console.error);
