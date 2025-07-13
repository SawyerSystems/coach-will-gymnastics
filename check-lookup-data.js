// Check what focus areas, apparatus, and side quests are available
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

async function checkLookupData() {
  console.log('Checking lookup tables...');
  
  // Check focus areas
  const focusAreas = await supabase
    .from('focus_areas')
    .select('*')
    .order('sort_order');
    
  console.log('Focus Areas:', focusAreas.data?.length || 0, 'items');
  focusAreas.data?.slice(0, 5).forEach(fa => console.log(`  ${fa.id}: ${fa.name}`));
  
  // Check apparatus
  const apparatus = await supabase
    .from('apparatus')
    .select('*')
    .order('sort_order');
    
  console.log('Apparatus:', apparatus.data?.length || 0, 'items');
  apparatus.data?.forEach(app => console.log(`  ${app.id}: ${app.name}`));
  
  // Check side quests
  const sideQuests = await supabase
    .from('side_quests')
    .select('*')
    .order('sort_order');
    
  console.log('Side Quests:', sideQuests.data?.length || 0, 'items');
  sideQuests.data?.slice(0, 5).forEach(sq => console.log(`  ${sq.id}: ${sq.name}`));
}

checkLookupData().catch(console.error);
