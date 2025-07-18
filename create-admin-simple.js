const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

async function createAdmin() {
  const email = 'admin@coachwilltumbles.com';
  const password = 'TumbleCoach2025!';
  
  console.log('Creating admin account...');
  
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase environment variables');
    return;
  }
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
  
  try {
    // Check if admin already exists
    const { data: existingAdmin } = await supabase
      .from('admins')
      .select('id, email')
      .eq('email', email)
      .single();
      
    if (existingAdmin) {
      console.log('Admin already exists with email:', email);
      return;
    }
    
    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create the admin
    const { data: admin, error } = await supabase
      .from('admins')
      .insert({
        email: email,
        password_hash: passwordHash
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating admin:', error);
      return;
    }
    
    console.log('✅ Admin created successfully!');
    console.log(`ID: ${admin.id}`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('Please change the password after first login.');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

createAdmin().then(() => process.exit(0));
