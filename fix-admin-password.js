import { supabase } from './server/supabase-client.ts';

async function fixAdminPassword() {
  console.log('🔧 Fixing admin password...');
  
  const correctHash = '$2b$12$3CFReNiYzIX3CpuFIRwYHOlNoVb4lqxNOlzsScs5kM9DqJq2yro1S';
  
  const { data, error } = await supabase
    .from('admins')
    .update({ password_hash: correctHash })
    .eq('email', 'admin@cwtumbles.com')
    .select();
  
  if (error) {
    console.error('❌ Failed to update admin password:', error);
  } else {
    console.log('✅ Admin password updated successfully');
  }
}

fixAdminPassword().catch(console.error);