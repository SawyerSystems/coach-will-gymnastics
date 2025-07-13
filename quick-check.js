// Simple check of athlete-parent relationships
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function quickCheck() {
  console.log('Quick relationship check...');
  
  // Count tables
  const bookings = await supabase.from('bookings').select('id', { count: 'exact', head: true });
  const athletes = await supabase.from('athletes').select('id', { count: 'exact', head: true });
  const parents = await supabase.from('parents').select('id', { count: 'exact', head: true });
  const bookingAthletes = await supabase.from('booking_athletes').select('id', { count: 'exact', head: true });
  
  console.log(`Bookings: ${bookings.count}`);
  console.log(`Athletes: ${athletes.count}`);
  console.log(`Parents: ${parents.count}`);
  console.log(`Booking-Athletes: ${bookingAthletes.count}`);
  
  // Check latest booking
  const latestBooking = await supabase
    .from('bookings')
    .select('id, parent_email')
    .order('id', { ascending: false })
    .limit(1)
    .single();
    
  console.log(`Latest booking: ${latestBooking.data?.id} for ${latestBooking.data?.parent_email}`);
  
  // Check latest athlete
  const latestAthlete = await supabase
    .from('athletes')
    .select('id, name, parent_id')
    .order('id', { ascending: false })
    .limit(1)
    .single();
    
  console.log(`Latest athlete: ${latestAthlete.data?.id} "${latestAthlete.data?.name}" -> parent ${latestAthlete.data?.parent_id}`);
}

quickCheck().catch(console.error);
