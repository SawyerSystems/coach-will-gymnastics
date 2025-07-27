require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Get Supabase URL from DATABASE_URL
let supabaseUrl;
if (process.env.DATABASE_URL) {
  // Extract from postgresql://postgres.xxx:password@host:5432/postgres
  const match = process.env.DATABASE_URL.match(/postgresql:\/\/.*@(.+?):5432/);
  if (match) {
    supabaseUrl = `https://${match[1]}`;
  }
} else if (process.env.SUPABASE_URL) {
  supabaseUrl = process.env.SUPABASE_URL;
}

const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl ? 'Found' : 'Missing');
console.log('Supabase Key:', supabaseKey ? 'Found' : 'Missing');

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugAthleteBookings() {
  console.log('=== Checking athlete 66 booking relationships ===');
  
  // Check booking_athletes table
  console.log('\n1. Checking booking_athletes for athlete 66:');
  const { data: bookingAthletes, error: baError } = await supabase
    .from('booking_athletes')
    .select('*')
    .eq('athlete_id', 66);
    
  if (baError) {
    console.error('Error fetching booking_athletes:', baError);
  } else {
    console.log('booking_athletes results:', bookingAthletes);
  }
  
  // Check if athlete 66 exists
  console.log('\n2. Checking if athlete 66 exists:');
  const { data: athlete, error: athleteError } = await supabase
    .from('athletes')
    .select('*')
    .eq('id', 66)
    .single();
    
  if (athleteError) {
    console.error('Error fetching athlete:', athleteError);
  } else {
    console.log('Athlete 66:', athlete);
  }
  
  // Check bookings that should have this athlete
  console.log('\n3. Checking bookings 126 and 127:');
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('*')
    .in('id', [126, 127]);
    
  if (bookingsError) {
    console.error('Error fetching bookings:', bookingsError);
  } else {
    console.log('Bookings 126 and 127:', bookings);
  }
  
  // Check all booking_athletes for these bookings
  console.log('\n4. Checking all booking_athletes for bookings 126 and 127:');
  const { data: allBookingAthletes, error: allBAError } = await supabase
    .from('booking_athletes')
    .select('*, athletes(*)')
    .in('booking_id', [126, 127]);
    
  if (allBAError) {
    console.error('Error fetching all booking_athletes:', allBAError);
  } else {
    console.log('All booking_athletes for these bookings:', JSON.stringify(allBookingAthletes, null, 2));
  }
}

debugAthleteBookings().catch(console.error);
