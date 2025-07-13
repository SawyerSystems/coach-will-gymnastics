import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
  ssl: { rejectUnauthorized: false }
});

async function setupSupabase() {
  try {
    console.log('Connecting to Supabase...');
    
    // Test connection
    const result = await sql`SELECT current_database(), current_user, version()`;
    console.log('Connected to:', result[0]);
    
    // Create a simple test table first
    await sql`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT NOT NULL,
        category TEXT NOT NULL,
        image_url TEXT,
        published_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    
    console.log('Created blog_posts table');
    
    // Insert sample data
    await sql`
      INSERT INTO blog_posts (title, content, excerpt, category) 
      VALUES ('Welcome to Supabase', 'This is our first blog post on Supabase!', 'Welcome message', 'announcement')
      ON CONFLICT DO NOTHING
    `;
    
    console.log('Inserted sample data');
    
    // Verify
    const posts = await sql`SELECT COUNT(*) as count FROM blog_posts`;
    console.log('Blog posts count:', posts[0].count);
    
    await sql.end();
    
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

setupSupabase().then(() => {
  console.log('Setup completed!');
  process.exit(0);
});