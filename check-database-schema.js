import { SupabaseStorage } from './server/storage.ts';

async function checkDatabaseSchema() {
  const storage = new SupabaseStorage();
  
  try {
    // Get the bookings table schema from Supabase
    console.log('Checking bookings table schema...');
    const { data, error } = await storage.supabase
      .from('bookings')
      .select('*')
      .limit(0);
    
    if (error) {
      console.error('Error checking bookings schema:', error);
      return;
    }
    
    // Try to see what columns are available
    console.log('Attempting to get table structure...');
    
    // Check if focus_areas column exists by trying a simple query
    const testQuery = await storage.supabase
      .from('bookings')
      .select('id, created_at, status')
      .limit(1);
      
    console.log('Basic query result:', testQuery);
    
    // Check if we can query focus_areas
    const focusAreasTest = await storage.supabase
      .from('bookings')
      .select('focus_areas')
      .limit(1);
      
    console.log('Focus areas test:', focusAreasTest);
    
    // Check booking_focus_areas table if it exists
    const joinTableTest = await storage.supabase
      .from('booking_focus_areas')
      .select('*')
      .limit(1);
      
    console.log('Join table test:', joinTableTest);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkDatabaseSchema();
