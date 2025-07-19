import 'dotenv/config';

console.log('🔐 Environment Variables Check');
console.log('==============================');

console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_ANON_KEY exists:', !!process.env.SUPABASE_ANON_KEY);
console.log('SUPABASE_ANON_KEY length:', process.env.SUPABASE_ANON_KEY?.length);
console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log('SUPABASE_SERVICE_ROLE_KEY length:', process.env.SUPABASE_SERVICE_ROLE_KEY?.length);
console.log('SUPABASE_SECRET_KEY exists:', !!process.env.SUPABASE_SECRET_KEY);
console.log('SUPABASE_SECRET_KEY length:', process.env.SUPABASE_SECRET_KEY?.length);
console.log('SUPABASE_SECRET_KEY format:', process.env.SUPABASE_SECRET_KEY?.substring(0, 20) + '...');

// Check if secret key is the new API key format
if (process.env.SUPABASE_SECRET_KEY?.startsWith('sb_secret_')) {
  console.log('✅ Secret key appears to be in correct API key format');
} else {
  console.log('⚠️ Secret key format may be incorrect (should start with sb_secret_)');
}

// Check if service role key is JWT format
if (process.env.SUPABASE_SERVICE_ROLE_KEY?.startsWith('eyJ')) {
  console.log('✅ Service role key appears to be in JWT format');
} else {
  console.log('⚠️ Service role key format may be incorrect (should start with eyJ)');
}
