// Quick check of current athlete-parent relationships
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function quickCheck() {
  console.log('Current athlete-parent relationships:');
  
  const athletes = await supabase
    .from('athletes')
    .select('id, name, parent_id')
    .order('id');
    
  const parents = await supabase
    .from('parents')
    .select('id, first_name, last_name, email')
    .order('id');
    
  console.log('\nParents:');
  parents.data?.forEach(p => console.log(`  ${p.id}: ${p.first_name} ${p.last_name} (${p.email})`));
  
  console.log('\nAthletes:');
  athletes.data?.forEach(a => console.log(`  ${a.id}: ${a.name} → Parent ID ${a.parent_id}`));
  
  // Check for orphans
  const orphans = athletes.data?.filter(a => !a.parent_id) || [];
  console.log(`\nOrphaned athletes: ${orphans.length}`);
}

quickCheck().catch(console.error);
